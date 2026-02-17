import { Router, type Request, type Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { config } from "../config/index.js";

const router = Router();

interface ConnectRepoBody {
  repo: string;
  criteria?: Record<string, unknown>; // Optional: AI review guidance
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
}

interface GitHubWebhook {
  id: number;
}

const isValidRepoFullName = (repo: string): boolean => {
  return /^[^/\s]+\/[^/\s]+$/.test(repo);
};

/**
 * @swagger
 * /api/repos/connect:
 *   post:
 *     summary: Connect a repository and install a GitHub webhook
 *     tags: [Repositories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - repo
 *             properties:
 *               repo:
 *                 type: string
 *                 description: Full name of the repository (owner/repo)
 *                 example: octocat/hello-world
 *               criteria:
 *                 type: object
 *                 description: Optional AI review guidance
 *     responses:
 *       201:
 *         description: Repository connected successfully
 *       400:
 *         description: Missing required field or invalid format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions or token not found
 *       409:
 *         description: Repo already connected
 *       500:
 *         description: Internal server error
 */
router.post("/connect", async (req: Request, res: Response) => {
  const { repo, criteria } = req.body as ConnectRepoBody;

  if (!req.authUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!repo) {
    return res
      .status(400)
      .json({ error: "Missing required field: repo" });
  }

  if (!isValidRepoFullName(repo)) {
    return res.status(400).json({ error: "Invalid repo format. Use owner/repo" });
  }

  try {
    // Check repo isn't already connected
    const existingRepo = await prisma.repository.findUnique({
      where: { fullName: repo },
    });

    if (existingRepo) {
      return res.status(409).json({ error: "Repo already connected" });
    }

    // Fetch user to get their githubToken
    const user = await prisma.user.findUnique({
      where: { id: req.authUserId },
      select: { githubToken: true },
    });

    if (!user?.githubToken) {
      return res.status(403).json({ error: "GitHub token not found. Please re-authenticate." });
    }

    // Install webhook on GitHub
    const webhookResponse = await fetch(`https://api.github.com/repos/${repo}/hooks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        name: "web",
        active: true,
        events: ["pull_request", "issues", "issue_comment"],
        config: {
          url: `${config.shadeAgentUrl}/api/webhook`,
          content_type: "json",
          secret: config.github.webhookSecret,
        },
      }),
    });

    if (webhookResponse.status === 403) {
      console.error("GitHub webhook install failed: Insufficient permissions");
      return res.status(403).json({
        error: "Insufficient GitHub permissions. Make sure you have admin access to this repo.",
      });
    }

    if (!webhookResponse.ok) {
      const errorData = await webhookResponse.json();
      console.error("GitHub webhook install failed:", errorData);
      return res.status(500).json({ error: "Failed to install GitHub webhook" });
    }

    const webhookData = (await webhookResponse.json()) as GitHubWebhook;

    // Fetch repo info from GitHub
    const repoResponse = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Authorization: `Bearer ${user.githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!repoResponse.ok) {
      console.error("Failed to fetch repo info from GitHub");
      return res.status(500).json({ error: "Failed to fetch repository info from GitHub" });
    }

    const githubRepo = (await repoResponse.json()) as GitHubRepo;

    // Create Repository in Prisma (without NEAR wallet yet - lazy loading)
    const repository = await prisma.repository.create({
      data: {
        githubId: githubRepo.id,
        name: githubRepo.name,
        fullName: githubRepo.full_name,
        url: githubRepo.html_url,
        webhookId: webhookData.id,
        nearWallet: null, // Lazy loaded later
        ownerId: req.authUserId,
      },
    });

    // Store criteria in Preference model (optional)
    if (criteria) {
      await prisma.preference.upsert({
        where: { repoId: repository.id },
        update: { settings: criteria as any },
        create: {
          repoId: repository.id,
          userId: req.authUserId,
          settings: criteria as any,
          source: "github_oauth",
        },
      });

      // Set criteria on Shade Agent (optional guidance for AI reviews)
      try {
        await fetch(`${config.shadeAgentUrl}/api/criteria`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repo: githubRepo.full_name,
            criteria: JSON.stringify(criteria),
          }),
        });
      } catch (err) {
        console.error("Shade Agent criteria error (non-fatal):", err);
        // Don't fail the connection if criteria sync fails
      }
    }

    // NOTE: Contract registration is deferred until nearWallet is set
    // User will call PUT /repos/:owner/:repo to add NEAR wallet later

    return res.status(201).json(repository);
  } catch (err) {
    console.error("Connect repo error:", err);
    return res.status(500).json({ error: "Failed to connect repository" });
  }
});

/**
 * @swagger
 * /api/repos/me:
 *   get:
 *     summary: Get all repositories connected by the authenticated user
 *     tags: [Repositories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of connected repositories with bounty balance
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: Agent service unavailable
 */
router.get("/me", async (req: Request, res: Response) => {
  if (!req.authUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const repos = await prisma.repository.findMany({
      where: { ownerId: req.authUserId },
      include: {
        preferences: true,
      },
    });

    const enrichedRepos = await Promise.all(
      repos.map(async (repo) => {
        if (!repo.fullName) return repo;
        const [owner, name] = repo.fullName.split("/");

        try {
          const bountyResponse = await fetch(
            `${config.shadeAgentUrl}/api/bounty/${owner}/${name}`
          );

          if (!bountyResponse.ok) {
            console.error("Failed to fetch bounty from Shade Agent");
            throw new Error("Agent service unavailable");
          }

          const bountyData = await bountyResponse.json();
          return { ...repo, bountyBalance: bountyData.balance };
        } catch (err) {
          console.error("Shade Agent bounty error:", err);
          throw err;
        }
      })
    );

    return res.json(enrichedRepos);
  } catch (err) {
    console.error("Get repos error:", err);
    return res.status(503).json({ error: "Agent service unavailable" });
  }
});

/**
 * @swagger
 * /api/repos/{owner}/{repo}:
 *   delete:
 *     summary: Disconnect a repository and remove its webhook
 *     tags: [Repositories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: owner
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: repo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Repository disconnected successfully
 *       403:
 *         description: Not the owner or missing token
 *       404:
 *         description: Repository not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:owner/:repo", async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  const fullName = `${owner}/${repo}`;

  try {
    // Find repo in Prisma
    const repository = await prisma.repository.findUnique({
      where: { fullName: fullName },
      select: {
        id: true,
        ownerId: true,
        webhookId: true,
      },
    });

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    // Verify ownership
    if (repository.ownerId !== req.authUserId) {
      return res.status(403).json({ error: "You do not own this repository" });
    }

    // Fetch user's GitHub token
    const user = await prisma.user.findUnique({
      where: { id: req.authUserId },
      select: { githubToken: true },
    });

    if (!user?.githubToken) {
      return res.status(403).json({ error: "GitHub token not found" });
    }

    // Remove webhook from GitHub
    if (repository.webhookId) {
      const deleteResponse = await fetch(
        `https://api.github.com/repos/${fullName}/hooks/${repository.webhookId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!deleteResponse.ok) {
        console.error("Failed to delete webhook from GitHub:", deleteResponse.statusText);
      }
    }

    // Delete repo from Prisma (cascades to reviews, issues, preferences)
    await prisma.repository.delete({
      where: { id: repository.id },
    });

    return res.json({ message: "Repository disconnected successfully" });
  } catch (err) {
    console.error("Delete repo error:", err);
    return res.status(500).json({ error: "Failed to delete repository" });
  }
});

/**
 * @swagger
 * /api/repos/{owner}/{repo}:
 *   put:
 *     summary: Update repository (e.g., add NEAR wallet and trigger contract registration)
 *     tags: [Repositories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: owner
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: repo
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nearWallet
 *             properties:
 *               nearWallet:
 *                 type: string
 *                 example: maintainer.testnet
 *     responses:
 *       200:
 *         description: NEAR wallet added and contract registered successfully
 *       400:
 *         description: Missing required field
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the owner
 *       404:
 *         description: Repository not found
 *       503:
 *         description: Agent service unavailable or contract registration failed
 */
router.put("/:owner/:repo", async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  const fullName = `${owner}/${repo}`;
  console.log(req.body);
  const { nearWallet } = req.body || {};

  if (!req.authUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!nearWallet) {
    return res.status(400).json({ error: "Missing required field: nearWallet" });
  }

  try {
    // Find repo and verify ownership
    const repository = await prisma.repository.findUnique({
      where: { fullName },
      select: { id: true, ownerId: true, nearWallet: true },
    });

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    if (repository.ownerId !== req.authUserId) {
      return res.status(403).json({ error: "You do not own this repository" });
    }

    // Update nearWallet in database
    await prisma.repository.update({
      where: { id: repository.id },
      data: { nearWallet },
    });

    // Register with contract (lazy loading trigger)
    try {
      const registerResponse = await fetch(`${config.shadeAgentUrl}/api/repo/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: fullName,
          maintainerNearId: nearWallet,
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        console.error("Failed to register repo on contract:", errorData);
        // Rollback database update
        await prisma.repository.update({
          where: { id: repository.id },
          data: { nearWallet: repository.nearWallet },
        });
        return res.status(503).json({
          error: "Failed to register with contract",
          details: errorData
        });
      }

      const result = await registerResponse.json();
      return res.json({
        message: "NEAR wallet added and contract registered successfully",
        nearWallet,
        contractRegistration: result
      });
    } catch (err) {
      console.error("Contract registration error:", err);
      // Rollback database update
      await prisma.repository.update({
        where: { id: repository.id },
        data: { nearWallet: repository.nearWallet },
      });
      return res.status(503).json({ error: "Agent service unavailable" });
    }
  } catch (err) {
    console.error("Update repo error:", err);
    return res.status(500).json({ error: "Failed to update repository" });
  }
});

/**
 * @swagger
 * /api/repos/{owner}/{repo}/issues:
 *   get:
 *     summary: Get all open issues for a connected repository
 *     tags: [Repositories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: owner
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: repo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of open issues
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the owner or token missing
 *       404:
 *         description: Repository not found
 */
router.get("/:owner/:repo/issues", async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  const fullName = `${owner}/${repo}`;

  if (!req.authUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // 1. Verify repository ownership and get user token
    const repository = await prisma.repository.findUnique({
      where: { fullName },
      select: {
        ownerId: true,
        owner: { select: { githubToken: true } }
      },
    });

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    if (repository.ownerId !== req.authUserId) {
      return res.status(403).json({ error: "You do not own this repository" });
    }

    const token = repository.owner?.githubToken;
    if (!token) {
      return res.status(403).json({ error: "GitHub token missing. Please re-authenticate." });
    }

    // 2. Fetch issues from GitHub API
    const githubResponse = await fetch(`https://api.github.com/repos/${fullName}/issues?state=open&pulls=false`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!githubResponse.ok) {
      const errorData = await githubResponse.json();
      console.error("GitHub issues fetch failed:", errorData);
      return res.status(githubResponse.status).json({ error: "Failed to fetch issues from GitHub" });
    }

    const issues = await githubResponse.json();

    // Filter out PRs if they were accidentally included (GitHub API /issues sometimes includes PRs)
    const filteredIssues = issues.filter((issue: any) => !issue.pull_request);

    return res.json(filteredIssues);
  } catch (err) {
    console.error("Fetch issues error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /api/repos/{owner}/{repo}/bounty:
 *   get:
 *     summary: Get current bounty balance for a repository
 *     tags: [Repositories]
 *     parameters:
 *       - in: path
 *         name: owner
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: repo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bounty data
 *       503:
 *         description: Agent service unavailable
 */
router.get("/:owner/:repo/bounty", async (req: Request, res: Response) => {
  const { owner, repo } = req.params;

  try {
    const bountyResponse = await fetch(`${config.shadeAgentUrl}/api/bounty/${owner}/${repo}`);

    if (!bountyResponse.ok) {
      console.error("Failed to fetch bounty from Shade Agent");
      return res.status(503).json({ error: "Agent service unavailable" });
    }

    const bountyData = await bountyResponse.json();
    return res.json(bountyData);
  } catch (err) {
    console.error("Bounty fetch error:", err);
    return res.status(503).json({ error: "Agent service unavailable" });
  }
});

// GET /api/repos/:owner/:repo/balance (alias for bounty)
router.get("/:owner/:repo/balance", async (req: Request, res: Response) => {
  const { owner, repo } = req.params;

  try {
    const bountyResponse = await fetch(`${config.shadeAgentUrl}/api/bounty/${owner}/${repo}`);

    if (!bountyResponse.ok) {
      console.error("Failed to fetch bounty from Shade Agent");
      return res.status(503).json({ error: "Agent service unavailable" });
    }

    const bountyData = await bountyResponse.json();
    return res.json(bountyData);
  } catch (err) {
    console.error("Bounty fetch error:", err);
    return res.status(503).json({ error: "Agent service unavailable" });
  }
});

/**
 * @swagger
 * /api/repos/{owner}/{repo}/fund:
 *   post:
 *     summary: Get instructions for funding a repository's bounty pool
 *     tags: [Repositories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: owner
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: repo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Funding instructions and CLI example
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the owner
 *       404:
 *         description: Repository not found
 *       503:
 *         description: Agent service unavailable
 */
router.post("/:owner/:repo/fund", async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  const fullName = `${owner}/${repo}`;

  if (!req.authUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Verify repo ownership
    const repository = await prisma.repository.findUnique({
      where: { fullName },
      select: { ownerId: true, nearWallet: true, owner: { select: { username: true } } },
    });

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    if (repository.ownerId !== req.authUserId) {
      return res.status(403).json({ error: "You do not own this repository" });
    }

    // Get contract info from shade agent
    const healthResponse = await fetch(`${config.shadeAgentUrl}/api/health`);
    if (!healthResponse.ok) {
      return res.status(503).json({ error: "Agent service unavailable" });
    }

    const healthData = await healthResponse.json();
    const contractId = healthData.agentAccountId;
    const maintainerAccount = repository.nearWallet || `${repository.owner.username}.testnet`;

    return res.json({
      message: "To fund your repo's bounty pool, call the NEAR contract directly",
      instructions: {
        method: "fund_bounty",
        contractId: contractId,
        args: { repo_id: fullName },
        deposit: "Amount in NEAR you want to deposit",
        maintainerAccount: maintainerAccount,
      },
      cliExample: `near call ${contractId} fund_bounty '{"repo_id": "${fullName}"}' --accountId ${maintainerAccount} --deposit 10`,
    });
  } catch (err) {
    console.error("Fund endpoint error:", err);
    return res.status(500).json({ error: "Failed to generate funding instructions" });
  }
});

export default router;