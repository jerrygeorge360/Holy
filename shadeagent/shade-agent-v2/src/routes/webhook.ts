import crypto from "crypto";
import express, { Request, Response } from "express";
import axios from "axios";
import { reviewPullRequest } from "../services/review";
import { postPayoutComment, postReviewComment } from "../services/github";
import { releaseBounty } from "../services/bounty";
import { getCriteria } from "../store/criteria";

const router = express.Router();

const VALID_ACTIONS = new Set(["opened", "synchronize", "reopened", "closed"]);

function verifySignature(rawBody: Buffer, signatureHeader?: string): boolean {
  if (!signatureHeader) return false;
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return false;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawBody);
  const expected = `sha256=${hmac.digest("hex")}`;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signatureHeader),
    );
  } catch {
    return false;
  }
}

/**
 * @swagger
 * /api/webhook:
 *   post:
 *     summary: GitHub Webhook Listener
 *     description: |
 *       Receives pull request events from GitHub.
 *       In the "Automated Continuation" flow, this endpoint coordinates with the Backend
 *       to fetch the repository owner's OAuth token for diff retrieval and commenting.
 *       Requires x-hub-signature-256 for verification.
 *     tags: [Webhook]
 *     parameters:
 *       - in: header
 *         name: x-hub-signature-256
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-github-event
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pull_request]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Event processed or ignored
 *       400:
 *         description: Invalid JSON or missing data
 *       401:
 *         description: Invalid signature
 *       500:
 *         description: Processing failed
 */
router.post("/", async (req: Request, res: Response) => {
  const signature = req.header("x-hub-signature-256");
  const event = req.header("x-github-event");

  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from("{}");

  if (!verifySignature(rawBody, signature)) {
    console.error("Webhook signature verification failed");
    return res.status(401).json({ error: "Invalid signature" });
  }

  if (event !== "pull_request") {
    return res.status(200).json({ status: "ignored" });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch (error) {
    console.error("Failed to parse webhook payload:", error);
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const action = payload?.action;
  if (!VALID_ACTIONS.has(action)) {
    return res.status(200).json({ status: "ignored" });
  }

  const pr = payload?.pull_request;
  if (!pr) {
    return res.status(400).json({ error: "Missing pull_request data" });
  }

  const repoFullName = payload?.repository?.full_name;
  const prNumber = pr?.number;
  const prTitle = pr?.title;
  const prBody = pr?.body || "";
  const diffUrl = pr?.diff_url;
  const contributor = pr?.user?.login;
  const baseBranch = pr?.base?.ref;
  const headBranch = pr?.head?.ref;

  if (
    !repoFullName ||
    !prNumber ||
    !prTitle ||
    !diffUrl ||
    !contributor ||
    !baseBranch ||
    !headBranch
  ) {
    return res.status(400).json({ error: "Incomplete pull request data" });
  }

  try {
    const backendUrl = process.env.BACKEND_URL;
    const agentSecret = process.env.MAINTAINER_SECRET;

    if (!backendUrl || !agentSecret) {
      console.error("Missing BACKEND_URL or MAINTAINER_SECRET");
      return res.status(500).json({ error: "Missing backend configuration" });
    }

    // Fetch bounty and owner token from backend
    const [owner, name] = repoFullName.split("/");
    const bountyResponse = await axios.get(
      `${backendUrl}/api/bounty/${owner}/${name}/pr/${prNumber}`,
      { headers: { "x-agent-secret": agentSecret } },
    );

    const { bounty, githubToken } = bountyResponse.data;

    if (!githubToken) {
      console.error("Failed to retrieve githubToken from backend");
      return res.status(500).json({ error: "Unauthorized: Missing GitHub permissions from owner" });
    }

    const diffResponse = await axios.get(diffUrl, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3.diff",
      },
      responseType: "text",
    });

    const diff = diffResponse.data as string;

    if (action === "closed" && pr?.merged) {
      if (!bounty?.amount) {
        return res.status(200).json({ status: "no-bounty-for-merge" });
      }

      const contributorWallet =
        process.env.TEST_CONTRIBUTOR_WALLET || contributor;

      const payoutResult = await releaseBounty({
        repoFullName,
        contributorWallet,
        prNumber,
        amount: String(bounty.amount),
      });

      const message = payoutResult.success
        ? `✅ Bounty released: ${bounty.amount} NEAR\nTx: ${payoutResult.txHash || ""}`
        : `❌ Bounty release failed: ${payoutResult.error || "Unknown error"}`;

      await postPayoutComment({
        repoFullName,
        prNumber,
        message,
        token: githubToken,
      });

      if (payoutResult.success && bounty?.id) {
        await axios.post(
          `${backendUrl}/api/bounty/${bounty.id}/mark-paid`,
          {},
          { headers: { "x-agent-secret": agentSecret } },
        );
      }

      return res.status(200).json({ status: "processed-merge" });
    }

    const reviewResult = await reviewPullRequest({
      diff,
      repoFullName,
      metadata: {
        number: prNumber,
        title: prTitle,
        body: prBody,
        contributor,
        baseBranch,
        headBranch,
        diffUrl,
      },
      criteria: await getCriteria(repoFullName) || "Standard code review.",
    });

    await postReviewComment({
      repoFullName,
      prNumber,
      review: reviewResult,
      token: githubToken,
    });
  } catch (error) {
    console.error("Failed to process webhook:", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }

  return res.status(200).json({ status: "processed" });
});

export default router;
