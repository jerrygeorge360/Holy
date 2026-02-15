import { Router, type Request, type Response } from "express";
import { config } from "../config/index.js";
import { prisma } from "../../lib/prisma.js";

const router = Router();

// POST /api/bounty/attach
// Attach a bounty to a GitHub issue or PR
router.post("/attach", async (req: Request, res: Response) => {
  const { repo, issueNumber, prNumber, amount } = req.body || {};

  if (!req.authUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!repo || !amount || (!issueNumber && !prNumber)) {
    return res.status(400).json({
      error: "repo, amount, and either issueNumber or prNumber are required",
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

    if (repository.ownerId !== req.authUserId) {
      return res.status(403).json({ error: "You do not own this repository" });
    }

    const existingBounty = await prisma.bounty.findFirst({
      where: {
        repoId: repository.id,
        ...(prNumber ? { prNumber: Number(prNumber) } : {}),
        ...(issueNumber ? { issueNumber: Number(issueNumber) } : {}),
      },
    });

    const bounty = existingBounty
      ? await prisma.bounty.update({
          where: { id: existingBounty.id },
          data: { amount: String(amount), status: "open" },
        })
      : await prisma.bounty.create({
          data: {
            repoId: repository.id,
            issueNumber: issueNumber ? Number(issueNumber) : null,
            prNumber: prNumber ? Number(prNumber) : null,
            amount: String(amount),
            status: "open",
          },
        });

    return res.status(201).json({ bounty });
  } catch (err) {
    console.error("Attach bounty error:", err);
    return res.status(500).json({ error: "Failed to attach bounty" });
  }
});

// GET /api/bounty/:owner/:repo/pr/:prNumber
// Used by Shade Agent to check bounty on merged PRs
router.get("/:owner/:repo/pr/:prNumber", async (req: Request, res: Response) => {
  const { owner, repo, prNumber } = req.params;
  const fullName = `${owner}/${repo}`;
  const agentSecret = req.header("x-agent-secret");

  if (!req.authUserId && agentSecret !== process.env.MAINTAINER_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const repository = await prisma.repository.findUnique({
      where: { fullName },
      select: { id: true },
    });

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    const bounty = await prisma.bounty.findFirst({
      where: {
        repoId: repository.id,
        prNumber: Number(prNumber),
        status: "open",
      },
    });

    if (!bounty) {
      return res.status(404).json({ error: "No bounty found for this PR" });
    }

    return res.json({ bounty });
  } catch (err) {
    console.error("Get bounty for PR error:", err);
    return res.status(500).json({ error: "Failed to fetch bounty" });
  }
});

// GET /api/bounty/:owner/:repo
// List all bounties for a repo (UI use)
router.get("/:owner/:repo", async (req: Request, res: Response) => {
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

// POST /api/bounty/:id/mark-paid
// Mark bounty as paid after successful payout (agent-only)
router.post("/:id/mark-paid", async (req: Request, res: Response) => {
  const { id } = req.params;
  const agentSecret = req.header("x-agent-secret");

  const bountyId = Array.isArray(id) ? id[0] : id;
  if (!bountyId) {
    return res.status(400).json({ error: "Missing bounty id" });
  }

  if (agentSecret !== process.env.MAINTAINER_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
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

// POST /api/bounty/release
// Proxy to shade agent's bounty release endpoint
router.post("/release", async (req: Request, res: Response) => {
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
          secret: process.env.MAINTAINER_SECRET,
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

// GET /api/bounty/history
// Proxy to shade agent's payout history endpoint
router.get("/history", async (req: Request, res: Response) => {
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
