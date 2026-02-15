import { Router, type Request, type Response } from "express";
import { prisma } from "../../lib/prisma.js";

const router = Router();

const SHADE_AGENT_URL = process.env.SHADE_AGENT_URL || "http://localhost:3000";
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "";

interface ConnectRepoBody {
  repo: string;
  nearWallet: string;
  criteria: Record<string, unknown>;
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

// POST /api/repos/connect
router.post("/connect", async (req: Request, res: Response) => {
  const { repo, nearWallet, criteria } = req.body as ConnectRepoBody;

  if (!req.authUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!repo || !nearWallet || !criteria) {
    return res
      .status(400)
      .json({ error: "Missing required fields: repo, nearWallet, criteria" });
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
        events: ["pull_request"],
        config: {
          url: `${SHADE_AGENT_URL}/api/webhook`,
          content_type: "json",
          secret: GITHUB_WEBHOOK_SECRET,
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

    // Create Repository in Prisma
    const repository = await prisma.repository.create({
      data: {
        githubId: githubRepo.id,
        name: githubRepo.name,
        fullName: githubRepo.full_name,
        url: githubRepo.html_url,
        webhookId: webhookData.id,
        nearWallet: nearWallet,
        ownerId: req.authUserId,
      },
    });

    // Store criteria in Preference model
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

    // Register repo on Shade Agent contract
    try {
      const registerResponse = await fetch(`${SHADE_AGENT_URL}/api/repo/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: githubRepo.full_name,
          maintainerWallet: nearWallet,
        }),
      });

      if (!registerResponse.ok) {
        console.error("Failed to register repo on Shade Agent:", registerResponse.statusText);
        await prisma.repository.delete({ where: { id: repository.id } });
        return res.status(503).json({ error: "Agent service unavailable" });
      }
    } catch (err) {
      console.error("Shade Agent registration error:", err);
      await prisma.repository.delete({ where: { id: repository.id } });
      return res.status(503).json({ error: "Agent service unavailable" });
    }

    // Set criteria on Shade Agent
    try {
      const criteriaResponse = await fetch(`${SHADE_AGENT_URL}/api/criteria`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: githubRepo.full_name,
          criteria: JSON.stringify(criteria),
        }),
      });

      if (!criteriaResponse.ok) {
        console.error("Failed to set criteria on Shade Agent:", criteriaResponse.statusText);
        await prisma.repository.delete({ where: { id: repository.id } });
        return res.status(503).json({ error: "Agent service unavailable" });
      }
    } catch (err) {
      console.error("Shade Agent criteria error:", err);
      await prisma.repository.delete({ where: { id: repository.id } });
      return res.status(503).json({ error: "Agent service unavailable" });
    }

    return res.status(201).json(repository);
  } catch (err) {
    console.error("Connect repo error:", err);
    return res.status(500).json({ error: "Failed to connect repository" });
  }
});

// GET /api/repos/me
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
            `${SHADE_AGENT_URL}/api/bounty/${owner}/${name}`
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

// DELETE /api/repos/:owner/:repo
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

// GET /api/repos/:owner/:repo/bounty
router.get("/:owner/:repo/bounty", async (req: Request, res: Response) => {
  const { owner, repo } = req.params;

  try {
    const bountyResponse = await fetch(`${SHADE_AGENT_URL}/api/bounty/${owner}/${repo}`);

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

export default router;