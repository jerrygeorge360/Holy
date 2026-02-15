import { Router, type Request, type Response } from "express";
import { config } from "../config/index.js";
import { prisma } from "../../lib/prisma.js";

const router = Router();

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
