import express, { Request, Response } from "express";

const criteriaStore = new Map<string, string>();

export function getCriteria(repoFullName: string): string | undefined {
  return criteriaStore.get(repoFullName.toLowerCase());
}

export function setCriteria(repoFullName: string, criteria: string): void {
  criteriaStore.set(repoFullName.toLowerCase(), criteria);
}

export const criteriaRouter = express.Router();

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
