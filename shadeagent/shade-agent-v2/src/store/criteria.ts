import express, { Request, Response } from "express";

const criteriaStore = new Map<string, string>();

export function getCriteria(repoFullName: string): string | undefined {
  return criteriaStore.get(repoFullName.toLowerCase());
}

export function setCriteria(repoFullName: string, criteria: string): void {
  criteriaStore.set(repoFullName.toLowerCase(), criteria);
}

export const criteriaRouter = express.Router();

criteriaRouter.get("/api/criteria", (req: Request, res: Response) => {
  const { repo } = req.query;

  if (!repo || typeof repo !== "string") {
    return res.status(400).json({ error: "repo query parameter required" });
  }

  const criteria = getCriteria(repo);
  return res.json({ repo, criteria: criteria || null });
});

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
