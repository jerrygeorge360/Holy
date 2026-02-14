import axios from "axios";
import { ReviewResult } from "./review";

interface PostCommentRequest {
  repoFullName: string;
  prNumber: number;
  review: ReviewResult;
}

function formatComment(review: ReviewResult): string {
  const status = review.approved ? "✅ Approved" : "❌ Changes requested";
  const issues = review.issues.length
    ? review.issues.map((issue) => `- ${issue}`).join("\n")
    : "- No issues found.";
  const suggestions = review.suggestions.length
    ? review.suggestions.map((suggestion) => `- ${suggestion}`).join("\n")
    : "- No suggestions.";

  return [
    `## Shade Agent Review`,
    `**Status:** ${status}`,
    `**Score:** ${review.score}/100`,
    ``,
    `**Summary**`,
    review.summary,
    ``,
    `**Issues**`,
    issues,
    ``,
    `**Suggestions**`,
    suggestions,
    ``,
    `> Note: The AI does not close PRs. Maintainers decide whether to close or merge.`,
  ].join("\n");
}

export async function postReviewComment(
  request: PostCommentRequest,
): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("Missing GITHUB_TOKEN");
  }

  const [owner, repo] = request.repoFullName.split("/");
  if (!owner || !repo) {
    throw new Error("Invalid repo full name");
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${request.prNumber}/comments`;
  const body = formatComment(request.review);

  try {
    await axios.post(
      url,
      { body },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );
  } catch (error) {
    console.error("Failed to post GitHub comment:", error);
    throw error;
  }
}

interface PayoutCommentRequest {
  repoFullName: string;
  prNumber: number;
  message: string;
}

export async function postPayoutComment(
  request: PayoutCommentRequest,
): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("Missing GITHUB_TOKEN");
  }

  const [owner, repo] = request.repoFullName.split("/");
  if (!owner || !repo) {
    throw new Error("Invalid repo full name");
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${request.prNumber}/comments`;

  try {
    await axios.post(
      url,
      { body: request.message },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );
  } catch (error) {
    console.error("Failed to post payout comment:", error);
    throw error;
  }
}
