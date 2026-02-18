import { Router, type Request, type Response } from "express";
import { config } from "../config/index.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

/**
 * @swagger
 * /api/criteria/{owner}/{repo}:
 *   get:
 *     summary: Get review criteria for a repository
 *     tags: [Criteria]
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
 *         description: Criteria data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the owner
 *       404:
 *         description: Repository not found
 *       503:
 *         description: Agent service unavailable
 */
router.get("/:owner/:repo", async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  const fullName = `${owner}/${repo}`;

  if (!req.authUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Verify repo exists and user has access
    const repository = await prisma.repository.findUnique({
      where: { fullName },
      select: { ownerId: true },
    });

    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }

    if (repository.ownerId !== req.authUserId) {
      return res.status(403).json({ error: "You do not own this repository" });
    }

    // Proxy to shade agent
    const criteriaResponse = await fetch(
      `${config.shadeAgentUrl}/api/criteria?repo=${fullName}`
    );

    if (!criteriaResponse.ok) {
      return res.status(503).json({ error: "Agent service unavailable" });
    }

    const criteriaData = await criteriaResponse.json();
    return res.json(criteriaData);
  } catch (err) {
    console.error("Get criteria error:", err);
    return res.status(503).json({ error: "Agent service unavailable" });
  }
});

/**
 * @swagger
 * /api/criteria/{owner}/{repo}:
 *   put:
 *     summary: Update review criteria for a repository
 *     tags: [Criteria]
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
 *               - criteria
 *             properties:
 *               criteria:
 *                 type: object
 *                 example: { "guidelines": ["Check for security", "Check for performance"] }
 *     responses:
 *       200:
 *         description: Criteria updated successfully
 *       400:
 *         description: Missing required field
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the owner
 *       404:
 *         description: Repository not found
 *       500:
 *         description: Internal server error
 *       503:
 *         description: Agent service unavailable
 */
router.put("/:owner/:repo", async (req: Request, res: Response) => {
  const { owner, repo } = req.params;
  const fullName = `${owner}/${repo}`;
  const { criteria } = req.body;

  if (!req.authUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!criteria) {
    return res.status(400).json({ error: "Missing required field: criteria" });
  }

  try {
    // Verify repo ownership
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

    // Update in local database
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

    // Proxy to shade agent
    const criteriaResponse = await fetch(
      `${config.shadeAgentUrl}/api/criteria`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: fullName,
          criteria: JSON.stringify(criteria),
        }),
      }
    );

    if (!criteriaResponse.ok) {
      return res.status(503).json({ error: "Agent service unavailable" });
    }

    const result = await criteriaResponse.json();
    return res.json(result);
  } catch (err) {
    console.error("Update criteria error:", err);
    return res.status(500).json({ error: "Failed to update criteria" });
  }
});

export default router;
