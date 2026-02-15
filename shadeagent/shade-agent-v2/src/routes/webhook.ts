import crypto from "crypto";
import express, { Request, Response } from "express";
import axios from "axios";
import { reviewPullRequest } from "../services/review";
import { postPayoutComment, postReviewComment } from "../services/github";
import { releaseBounty } from "../services/bounty";

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
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error("Missing GITHUB_TOKEN");
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
      const backendUrl = process.env.BACKEND_URL;
      const agentSecret = process.env.MAINTAINER_SECRET;

      if (!backendUrl || !agentSecret) {
        console.error("Missing BACKEND_URL or MAINTAINER_SECRET");
        return res.status(500).json({ error: "Missing backend configuration" });
      }

      try {
        const [owner, name] = repoFullName.split("/");
        const bountyResponse = await axios.get(
          `${backendUrl}/api/bounty/${owner}/${name}/pr/${prNumber}`,
          { headers: { "x-agent-secret": agentSecret } },
        );

        const bounty = bountyResponse.data?.bounty;
        if (!bounty?.amount) {
          return res.status(200).json({ status: "no-bounty" });
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
        });

        if (payoutResult.success && bounty?.id) {
          await axios.post(
            `${backendUrl}/api/bounty/${bounty.id}/mark-paid`,
            {},
            { headers: { "x-agent-secret": agentSecret } },
          );
        }
      } catch (error) {
        console.error("Failed to release bounty on merge:", error);
      }

      return res.status(200).json({ status: "processed" });
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
    });

    await postReviewComment({
      repoFullName,
      prNumber,
      review: reviewResult,
    });

    return res.status(200).json({ status: "processed" });
  } catch (error) {
    console.error("Failed to process webhook:", error);
    return res.status(500).json({ error: "Processing failed" });
  }
});

export default router;
