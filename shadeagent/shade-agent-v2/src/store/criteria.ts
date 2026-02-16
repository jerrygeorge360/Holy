import express, { Request, Response } from "express";

const criteriaStore = new Map<string, string>();

export function getCriteria(repoFullName: string): string | undefined {
  return criteriaStore.get(repoFullName.toLowerCase());
}

export function setCriteria(repoFullName: string, criteria: string): void {
  criteriaStore.set(repoFullName.toLowerCase(), criteria);
}

export const criteriaRouter = express.Router();

/**
 * @swagger
 * /api/criteria:
 *   get:
 *     summary: Get review criteria for a repository
 *     tags: [Criteria]
 *     parameters:
 *       - in: query
 *         name: repo
 *         required: true
 *         schema:
 *           type: string
 *         example: octocat/hello-world
 *     responses:
 *       200:
 *         description: Criteria record
 *       400:
 *         description: repo query parameter required
 */
criteriaRouter.get("/api/criteria", (req: Request, res: Response) => {
  const { repo } = req.query;

  if (!repo || typeof repo !== "string") {
    return res.status(400).json({ error: "repo query parameter required" });
  }

  const criteria = getCriteria(repo);
  return res.json({ repo, criteria: criteria || null });
});

/**
 * @swagger
 * /api/criteria:
 *   post:
 *     summary: Save review criteria for a repository
 *     tags: [Criteria]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - repo
 *               - criteria
 *               - secret
 *             properties:
 *               repo:
 *                 type: string
 *                 example: octocat/hello-world
 *               criteria:
 *                 type: string
 *               secret:
 *                 type: string
 *     responses:
 *       200:
 *         description: Criteria saved
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Invalid secret
 */
criteriaRouter.post("/api/criteria", (req: Request, res: Response) => {
  const { repo, criteria, secret } = req.body || {};

  if (!repo || !criteria || !secret) {
    return res.status(400).json({ error: "repo, criteria, and secret required" });
  }

  if (secret !== process.env.MAINTAINER_SECRET) {
    return res.status(401).json({ error: "Invalid secret" });
  }

  setCriteria(repo, criteria);
  return res.status(200).json({ status: "saved" });
});
