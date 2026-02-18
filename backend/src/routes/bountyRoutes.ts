import { Router, type Request, type Response } from "express";
import { config } from "../config/index.js";
import { prisma } from "../../lib/prisma.js";
import { requireAgentAuth, requireAuth } from "../middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /api/bounty/attach:
 *   post:
 *     summary: Attach a bounty to a GitHub issue or PR
 *     tags: [Bounties]
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
 *               - amount
 *             properties:
 *               repo:
 *                 type: string
 *                 example: octocat/hello-world
 *               issueNumber:
 *                 type: number
 *                 example: 42
 *               prNumber:
 *                 type: number
 *                 example: 101
 *               amount:
 *                 type: string
 *                 example: "10"
 *     responses:
 *       201:
 *         description: Bounty attached successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the owner
 *       404:
 *         description: Repository not found
 *       500:
 *         description: Internal server error
 */
router.post("/attach", async (req: Request, res: Response) => {
  const { repo, issueNumber, prNumber, amount } = req.body || {};
  const agentSecret = req.header("x-agent-secret");
  const isAgent = agentSecret && agentSecret === config.maintainerSecret;

  // Use requireAuth-like logic manually if not an agent
  if (!isAgent) {
    return requireAuth(req, res, async () => {
      await processAttach(false);
    });
  } else {
    await processAttach(true);
  }

  async function processAttach(isAgent: boolean) {
    if (!repo || (!amount && (!issueNumber || !prNumber)) || (!issueNumber && !prNumber)) {
      return res.status(400).json({
        error: "repo and either (amount + issue/PR) or (issue + PR for linking) are required",
      });
    }

    try {
      const repository = await prisma.repository.findUnique({
        where: { fullName: repo },
        select: { id: true, ownerId: true },
      });

      if (!repository) {
        return res.status(404).json({ error: "Repository not found" });
      }

      // Only allow repo owner/maintainer to set custom bounty (not agent)
      if (!isAgent && amount) {
        if (repository.ownerId !== req.authUserId) {
          return res.status(403).json({ error: "You do not own this repository" });
        }
      }

      const existingBounty = await prisma.bounty.findFirst({
        where: {
          repoId: repository.id,
          ...(prNumber ? { prNumber: Number(prNumber) } : {}),
          ...(issueNumber ? { issueNumber: Number(issueNumber) } : {}),
        },
      });

      let bounty;
      if (existingBounty) {
        // Only allow update if owner/maintainer or agent
        if (!isAgent && repository.ownerId !== req.authUserId) {
          return res.status(403).json({ error: "You do not own this repository" });
        }
        bounty = await prisma.bounty.update({
          where: { id: existingBounty.id },
          data: { amount: String(amount), status: "open" },
        });
      } else {
        bounty = await prisma.bounty.create({
          data: {
            repoId: repository.id,
            issueNumber: issueNumber ? Number(issueNumber) : null,
            prNumber: prNumber ? Number(prNumber) : null,
            amount: String(amount),
            status: "open",
          },
        });
      }

      return res.status(201).json({ bounty });
    } catch (err) {
      console.error("Attach bounty error:", err);
      return res.status(500).json({ error: "Failed to attach bounty" });
    }
  }
});

/**
 * @swagger
 * /api/bounty/{owner}/{repo}/pr/{prNumber}:
 *   get:
 *     summary: Check bounty for a merged PR (Used by Shade Agent)
 *     tags: [Bounties]
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
 *       - in: path
 *         name: prNumber
 *         required: true
 *         schema:
 *           type: number
 *       - in: header
 *         name: x-agent-secret
 *         schema:
 *           type: string
 *         description: Shared secret for agent-only access
 *     responses:
 *       200:
 *         description: Bounty data and repo owner's GitHub token (if authorized)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bounty:
 *                   $ref: '#/components/schemas/Bounty'
 *                 githubToken:
 *                   type: string
 *                   description: The GitHub access token of the repository owner.
 *                   nullable: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Repository or bounty not found
 *       500:
 *         description: Internal server error
 */
router.get("/:owner/:repo/pr/:prNumber", async (req: Request, res: Response) => {
  const { owner, repo, prNumber } = req.params;
  const fullName = `${owner}/${repo}`;
  const agentSecret = req.header("x-agent-secret");

  if (!req.authUserId && agentSecret !== config.maintainerSecret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const repository = await prisma.repository.findUnique({
      where: { fullName },
      select: {
        id: true,
        owner: {
          select: {
            githubToken: true
          }
        }
      },
    });

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    let bounty = await prisma.bounty.findFirst({
      where: {
        repoId: repository.id,
        prNumber: Number(prNumber),
        status: "open",
      },
    });

    // If no bounty exists and agent is requesting, auto-create with default amount
    if (!bounty && agentSecret === config.maintainerSecret) {
      bounty = await prisma.bounty.create({
        data: {
          repoId: repository.id,
          prNumber: Number(prNumber),
          amount: "0.1",
          status: "open",
        },
      });
    }

    const githubToken = agentSecret === config.maintainerSecret ? repository.owner?.githubToken : null;

    if (!bounty) {
      if (agentSecret === config.maintainerSecret) {
        return res.json({ bounty: null, githubToken });
      }
      return res.status(404).json({ error: "No bounty found for this PR" });
    }

    return res.json({ bounty, githubToken });
  } catch (err) {
    console.error("Get bounty for PR error:", err);
    return res.status(500).json({ error: "Failed to fetch bounty" });
  }
});

/**
 * @swagger
 * /api/bounty/explore:
 *   get:
 *     summary: List all open bounties across all repositories (Public)
 *     tags: [Bounties]
 *     responses:
 *       200:
 *         description: List of open bounties with repo details
 *       500:
 *         description: Internal server error
 */
router.get("/explore", async (_req: Request, res: Response) => {
  try {
    const bounties = await prisma.bounty.findMany({
      where: { status: "open" },
      include: {
        repository: {
          select: {
            fullName: true,
            url: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ bounties });
  } catch (err) {
    console.error("Explore bounties error:", err);
    return res.status(500).json({ error: "Failed to explore bounties" });
  }
});

/**
 * @swagger
 * /api/bounty/{owner}/{repo}:
 *   get:
 *     summary: List all bounties for a repository
 *     tags: [Bounties]
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
 *         description: List of bounties
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the owner
 *       404:
 *         description: Repository not found
 *       500:
 *         description: Internal server error
 */
router.get("/:owner/:repo", requireAuth, async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  const fullName = `${owner}/${repo}`;

  if (!req.authUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const repository = await prisma.repository.findUnique({
      where: { fullName },
      select: { id: true, ownerId: true },
    });

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    if (repository.ownerId !== req.authUserId) {
      return res.status(403).json({ error: "You do not own this repository" });
    }

    const bounties = await prisma.bounty.findMany({
      where: { repoId: repository.id },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ bounties });
  } catch (err) {
    console.error("List bounties error:", err);
    return res.status(500).json({ error: "Failed to list bounties" });
  }
});

/**
 * @swagger
 * /api/bounty/{id}/mark-paid:
 *   post:
 *     summary: Mark bounty as paid (agent-only)
 *     tags: [Bounties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: header
 *         name: x-agent-secret
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bounty marked as paid
 *       400:
 *         description: Missing bounty id
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/:id/mark-paid", requireAgentAuth, async (req: Request, res: Response) => {
  const { id } = req.params;

  const bountyId = Array.isArray(id) ? id[0] : id;
  if (!bountyId) {
    return res.status(400).json({ error: "Missing bounty id" });
  }

  try {
    const bounty = await prisma.bounty.update({
      where: { id: bountyId },
      data: { status: "paid" },
    });

    return res.json({ bounty });
  } catch (err) {
    console.error("Mark bounty paid error:", err);
    return res.status(500).json({ error: "Failed to mark bounty as paid" });
  }
});

/**
 * @swagger
 * /api/bounty/release:
 *   post:
 *     summary: Trigger manual bounty release via Shade Agent
 *     tags: [Bounties]
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
 *               - contributorWallet
 *               - prNumber
 *             properties:
 *               repo:
 *                 type: string
 *                 example: octocat/hello-world
 *               contributorWallet:
 *                 type: string
 *                 example: contributor.testnet
 *               prNumber:
 *                 type: number
 *               amount:
 *                 type: string
 *                 example: "10"
 *     responses:
 *       200:
 *         description: Bounty release triggered
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the owner
 *       404:
 *         description: Repository not found
 *       500:
 *         description: Internal server error
 */
router.post("/release", requireAuth, async (req: Request, res: Response) => {
  const { repo, contributorWallet, prNumber, amount } = req.body;

  if (!req.authUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!repo || !contributorWallet || !prNumber) {
    return res.status(400).json({
      error: "Missing required fields: repo, contributorWallet, prNumber",
    });
  }

  try {
    // Verify repo ownership
    const repository = await prisma.repository.findUnique({
      where: { fullName: repo },
      select: { ownerId: true },
    });

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    if (repository.ownerId !== req.authUserId) {
      return res.status(403).json({ error: "You do not own this repository" });
    }

    // Proxy to shade agent
    const releaseResponse = await fetch(
      `${config.shadeAgentUrl}/api/bounty/release`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo,
          contributorWallet,
          prNumber,
          amount,
          secret: config.maintainerSecret,
        }),
      }
    );

    if (!releaseResponse.ok) {
      const errorData = await releaseResponse.json();
      return res.status(releaseResponse.status).json(errorData);
    }

    const result = await releaseResponse.json();
    return res.json(result);
  } catch (err) {
    console.error("Bounty release error:", err);
    return res.status(500).json({ error: "Failed to release bounty" });
  }
});

/**
 * @swagger
 * /api/bounty/history:
 *   get:
 *     summary: Get bounty payout history from Shade Agent
 *     tags: [Bounties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payout history list
 *       401:
 *         description: Unauthorized
 *       503:
 *         description: Agent service unavailable
 */
router.get("/history", requireAuth, async (req: Request, res: Response) => {
  if (!req.authUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const historyResponse = await fetch(
      `${config.shadeAgentUrl}/api/bounty/history`
    );

    if (!historyResponse.ok) {
      return res.status(503).json({ error: "Agent service unavailable" });
    }

    const historyData = await historyResponse.json();
    return res.json(historyData);
  } catch (err) {
    console.error("Bounty history error:", err);
    return res.status(503).json({ error: "Agent service unavailable" });
  }
});

export default router;
