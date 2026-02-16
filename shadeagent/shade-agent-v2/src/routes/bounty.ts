import express, { Request, Response } from "express";
import { getBounty, releaseBounty, registerRepo } from "../services/bounty";
import { getPayouts } from "../store/payoutLog";

const router = express.Router();

/**
 * @swagger
 * /api/repo/register:
 *   post:
 *     summary: Register a repository with the Shade Agent
 *     tags: [Bounty]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - repo
 *               - maintainerNearId
 *             properties:
 *               repo:
 *                 type: string
 *                 example: octocat/hello-world
 *               maintainerNearId:
 *                 type: string
 *                 example: maintainer.testnet
 *     responses:
 *       200:
 *         description: Repository registered successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Registration failed
 */
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

/**
 * @swagger
 * /api/bounty/{owner}/{repo}:
 *   get:
 *     summary: Get bounty balance for a repository
 *     tags: [Bounty]
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
 *         description: Bounty balance data
 */
router.get("/api/bounty/:owner/:repo", async (req: Request, res: Response) => {
  const repo = `${req.params.owner}/${req.params.repo}`;
  const amount = await getBounty(repo);
  return res.json({ repo, amount, currency: "NEAR" });
});

/**
 * @swagger
 * /api/bounty/release:
 *   post:
 *     summary: Manually release a bounty
 *     tags: [Bounty]
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
 *               - secret
 *             properties:
 *               repo:
 *                 type: string
 *                 example: octocat/hello-world
 *               contributorWallet:
 *                 type: string
 *                 example: contributor.testnet
 *               prNumber:
 *                 type: number
 *               secret:
 *                 type: string
 *                 description: Maintainer secret for authorization
 *               amount:
 *                 type: string
 *                 description: Optional specific amount to release
 *     responses:
 *       200:
 *         description: Bounty released successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid secret
 *       500:
 *         description: Release failed
 */
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

/**
 * @swagger
 * /api/bounty/history:
 *   get:
 *     summary: Get payout history
 *     tags: [Bounty]
 *     responses:
 *       200:
 *         description: List of payout attempts
 */
router.get("/api/bounty/history", (_req: Request, res: Response) => {
  return res.json({ payouts: getPayouts() });
});

export default router;
