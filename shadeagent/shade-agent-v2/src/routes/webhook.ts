import crypto from "crypto";
import express, { Request, Response } from "express";
import axios from "axios";
import { reviewPullRequest } from "../services/review";
import { postPayoutComment, postReviewComment } from "../services/github";
import { releaseBounty } from "../services/bounty";
import { getCriteria } from "../store/criteria";

const router = express.Router();

const VALID_ACTIONS = new Set(["opened", "synchronize", "reopened", "closed", "created"]);
const BOUNTY_COMMAND_REGEX = /\/bounty\s+(\d+(\.\d+)?)/i;
const ISSUE_REF_REGEX = /#(\d+)/g;

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

  if (event !== "pull_request" && event !== "issues" && event !== "issue_comment") {
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

  const isIssue = event === "issues" || event === "issue_comment";
  const pr = isIssue ? (payload?.issue?.pull_request ? payload.issue : null) : payload?.pull_request;

  // Quick check for issue vs PR
  const issueNumber = payload?.issue?.number || payload?.pull_request?.number;
  const isRealIssue = isIssue && !payload?.issue?.pull_request;

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
    !issueNumber ||
    !contributor
  ) {
    return res.status(400).json({ error: "Incomplete webhook data" });
  }

  try {
    const backendUrl = process.env.BACKEND_URL;
    const agentSecret = process.env.MAINTAINER_SECRET;

    if (!backendUrl || !agentSecret) {
      console.error("Missing BACKEND_URL or MAINTAINER_SECRET");
      return res.status(500).json({ error: "Missing backend configuration" });
    }

    // 🔍 Feature: Automatic Bounty Sync from GitHub Comments
    if (event === "issue_comment" || (event === "issues" && action === "opened")) {
      const textToScan = payload?.comment?.body || payload?.issue?.body || "";
      const bountyMatch = textToScan.match(BOUNTY_COMMAND_REGEX);

      if (bountyMatch) {
        const amount = bountyMatch[1];
        console.info(`[Bounty Sync] Detected bounty command: ${amount} NEAR for Issue #${issueNumber}`);

        try {
          await axios.post(
            `${backendUrl}/api/bounty/attach`,
            {
              repo: repoFullName,
              issueNumber: isRealIssue ? issueNumber : undefined,
              prNumber: !isRealIssue ? issueNumber : undefined,
              amount: amount
            },
            { headers: { "x-agent-secret": agentSecret } }
            // Note: We'll need to allow Agent to call attach in the backend next
          );
          console.info(`[Bounty Sync] Successfully synced bounty to backend.`);
        } catch (err: any) {
          console.error(`[Bounty Sync] Failed to sync to backend:`, err.message);
        }
      }

      // If it's just a comment/issue and not a PR review candidate, we can stop here
      if (isRealIssue || event === "issue_comment") {
        return res.status(200).json({ status: "processed-sync" });
      }
    }

    // --- Original PR Flow starts here ---
    const prTitle = pr?.title;
    const diffUrl = pr?.diff_url;
    if (!prTitle || !diffUrl) return res.status(200).json({ status: "ignored-non-pr" });

    const [owner, name] = repoFullName.split("/");

    // 🔗 Feature: Auto-link PR to Issue Bounty
    if (event === "pull_request" && action === "opened") {
      const matches = [...prBody.matchAll(ISSUE_REF_REGEX)];
      for (const match of matches) {
        const refIssueNumber = match[1];
        console.info(`[Bounty Link] PR #${issueNumber} references Issue #${refIssueNumber}. Syncing...`);
        try {
          await axios.post(
            `${backendUrl}/api/bounty/attach`,
            {
              repo: repoFullName,
              issueNumber: Number(refIssueNumber),
              prNumber: Number(issueNumber)
            },
            { headers: { "x-agent-secret": agentSecret } }
          );
        } catch (err: any) {
          console.warn(`[Bounty Link] Could not link PR to Issue #${refIssueNumber}:`, err.message);
        }
      }
    }

    // Fetch bounty and owner token from backend
    const bountyResponse = await axios.get(
      `${backendUrl}/api/bounty/${owner}/${name}/pr/${prNumber}`,
      { headers: { "x-agent-secret": agentSecret } },
    );

    const { bounty, githubToken } = bountyResponse.data;
    console.info(`[Step 1] Retrieved backend data. Bounty: ${bounty ? "Yes" : "No"}, Token: ${githubToken ? "Yes" : "No"}`);

    if (!githubToken) {
      console.error("Failed to retrieve githubToken from backend");
      return res.status(424).json({ error: "Failed Dependency: Missing repository owner permissions" });
    }

    console.info(`[Step 2] Fetching diff for PR #${prNumber} from ${diffUrl}`);

    const diffResponse = await axios.get(diffUrl, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3.diff",
      },
      responseType: "text",
    });

    let diff = diffResponse.data as string;
    if (diff.length > 50000) {
      if (process.env.DEBUG === "true") {
        console.warn(`Diff size too large (${diff.length} chars). Truncating to 50000.`);
      }
      diff = diff.slice(0, 50000) + "\n\n[Diff truncated due to size]";
    }
    console.info(`[Step 3] Diff retrieved (${diff.length} chars).`);

    if (action === "closed" && pr?.merged) {
      let payoutBounty = bounty;
      // If no bounty, create one with default amount 0.1 NEAR
      if (!payoutBounty) {
        const createResp = await axios.post(
          `${backendUrl}/api/bounty/attach`,
          {
            repo: repoFullName,
            prNumber,
            amount: "0.1",
          },
          { headers: { "x-agent-secret": agentSecret } }
        );
        payoutBounty = createResp.data.bounty;
      }


      // Extract /link-wallet <wallet> from PR body or comments
      let contributorWallet = process.env.TEST_CONTRIBUTOR_WALLET;
      if (!contributorWallet) {
        const linkWalletRegex = /\/link-wallet\s+([a-zA-Z0-9_.-]+\.testnet)/i;
        let match = prBody.match(linkWalletRegex);
        if (!match && payload?.comment?.body) {
          match = payload.comment.body.match(linkWalletRegex);
        }
        if (match) {
          contributorWallet = match[1];
        }
      }

      // If no wallet found, do not attempt payout
      if (!contributorWallet) {
        console.warn("No /link-wallet found in PR body or comments. Skipping payout.");
        return res.status(200).json({ status: "skipped-no-wallet" });
      }

      // Retry logic for payout (up to 3 times)
      let payoutResult: { success?: boolean; txHash?: string; error?: string } | undefined = undefined;
      let attempts = 0;
      while (attempts < 3) {
        try {
          payoutResult = await releaseBounty({
            repoFullName,
            contributorWallet,
            prNumber,
            amount: String(payoutBounty.amount),
          });
          if (payoutResult?.success) break;
        } catch (err: any) {
          console.warn(`Payout attempt ${attempts + 1} failed:`, err.message || err);
        }
        attempts++;
        if (!payoutResult?.success) await new Promise(r => setTimeout(r, 1000 * attempts));
      }

      // If payoutResult is still undefined after retries, mark it as a failed result
      if (!payoutResult) {
        payoutResult = { success: false, error: "Payout failed after retries" };
      }

      const message = payoutResult.success
        ? `✅ Bounty released: ${payoutBounty.amount} NEAR\nTx: ${payoutResult.txHash || ""}`
        : `❌ Bounty release failed: ${payoutResult.error || "Unknown error"}`;

      await postPayoutComment({
        repoFullName,
        prNumber,
        message,
        token: githubToken,
      });

      if (payoutResult.success && payoutBounty?.id) {
        await axios.post(
          `${backendUrl}/api/bounty/${payoutBounty.id}/mark-paid`,
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
    console.info(`[Step 4] AI Review generated. Score: ${reviewResult.score}`);

    // Add bounty info to review if it exists
    const bountyInfo = bounty?.amount ? `💰 **Bounty Alert:** ${bounty.amount} NEAR is attached to this PR and will be released upon merge!` : "";

    await postReviewComment({
      repoFullName,
      prNumber: Number(issueNumber), // it's prNumber in this context
      review: reviewResult,
      token: githubToken,
      bountyMessage: bountyInfo
    });
    console.info(`[Step 5] Successfully posted review comment to PR #${prNumber}`);
  } catch (error: any) {
    console.error("Failed to process webhook:", error.response?.data || error.message);
    const status = error.response?.status === 404 ? 404 : 500;
    return res.status(status).json({
      error: "Webhook processing failed",
      details: error.response?.data?.error || error.message
    });
  }

  return res.status(200).json({ status: "processed" });
});

export default router;
