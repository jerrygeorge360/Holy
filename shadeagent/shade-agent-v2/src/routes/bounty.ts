import express, { Request, Response } from "express";
import { getBounty, releaseBounty, registerRepo } from "../services/bounty";
import { getPayouts } from "../store/payoutLog";

const router = express.Router();

router.post("/api/repo/register", async (req: Request, res: Response) => {
  const { repo, maintainerNearId } = req.body || {};

  if (!repo || !maintainerNearId) {
    return res.status(400).json({
      success: false,
      error: "repo and maintainerNearId are required",
    });
  }

  const result = await registerRepo(repo, maintainerNearId);
  return res.status(result.success ? 200 : 500).json(result);
});

router.get("/api/bounty/:owner/:repo", async (req: Request, res: Response) => {
  const repo = `${req.params.owner}/${req.params.repo}`;
  const amount = await getBounty(repo);
  return res.json({ repo, amount, currency: "NEAR" });
});

router.post("/api/bounty/release", async (req: Request, res: Response) => {
  const { repo, contributorWallet, prNumber, secret, amount } = req.body || {};

  if (!repo || !contributorWallet || !prNumber || !secret) {
    return res.status(400).json({
      success: false,
      error: "repo, contributorWallet, prNumber, and secret are required",
    });
  }

  if (secret !== process.env.MAINTAINER_SECRET) {
    return res.status(401).json({ success: false, error: "Invalid secret" });
  }

  const result = await releaseBounty({
    repoFullName: repo,
    contributorWallet,
    prNumber: Number(prNumber),
    amount,
  });

  return res.status(result.success ? 200 : 500).json(result);
});

router.get("/api/bounty/history", (_req: Request, res: Response) => {
  return res.json({ payouts: getPayouts() });
});

export default router;
