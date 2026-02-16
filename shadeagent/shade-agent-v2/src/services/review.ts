import axios from "axios";
import http from "http";
import https from "https";
import { getCriteria } from "../store/criteria";

export interface PullRequestMetadata {
  number: number;
  title: string;
  body: string;
  contributor: string;
  baseBranch: string;
  headBranch: string;
  diffUrl: string;
}

export interface ReviewResult {
  approved: boolean;
  score: number;
  summary: string;
  issues: string[];
  suggestions: string[];
}

interface ReviewRequest {
  diff: string;
  repoFullName: string;
  metadata: PullRequestMetadata;
  criteria?: string;
}

const DEFAULT_CRITERIA =
  "Code must be readable, well structured, and solve the stated problem.";

function buildPrompt(diff: string, criteria: string, metadata: PullRequestMetadata): string {
  return [
    "You are a senior code reviewer.",
    "Review the following GitHub pull request diff against the maintainer's criteria.",
    "Return ONLY valid JSON with the exact structure:",
    "{",
    "  \"approved\": boolean,",
    "  \"score\": number,",
    "  \"summary\": string,",
    "  \"issues\": string[],",
    "  \"suggestions\": string[]",
    "}",
    "Do not include markdown, commentary, or extra keys.",
    "---",
    `Title: ${metadata.title}`,
    `Contributor: ${metadata.contributor}`,
    `Base Branch: ${metadata.baseBranch}`,
    `Head Branch: ${metadata.headBranch}`,
    `Description: ${metadata.body || "(no description)"}`,
    "---",
    `Criteria: ${criteria}`,
    "---",
    "Diff:",
    diff,
  ].join("\n");
}

function safeJsonParse(raw: string): ReviewResult {
  const trimmed = raw.trim();

  const parseAttempt = (text: string): ReviewResult => {
    const parsed = JSON.parse(text);
    return {
      approved: Boolean(parsed.approved),
      score: Number(parsed.score),
      summary: String(parsed.summary || ""),
      issues: Array.isArray(parsed.issues)
        ? parsed.issues.map((item: unknown) => String(item))
        : [],
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.map((item: unknown) => String(item))
        : [],
    };
  };

  try {
    return parseAttempt(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return parseAttempt(trimmed.slice(firstBrace, lastBrace + 1));
    }
    throw new Error("Unable to parse LLM response as JSON");
  }
}

export async function reviewPullRequest(
  request: ReviewRequest,
): Promise<ReviewResult> {
  const criteria = request.criteria || getCriteria(request.repoFullName) || DEFAULT_CRITERIA;
  const apiKey = process.env.NEAR_AI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing NEAR_AI_API_KEY");
  }

  const prompt = buildPrompt(request.diff, criteria, request.metadata);

  try {
    const response = await axios.post(
      "https://cloud-api.near.ai/v1/chat/completions",
      {
        model: "openai/gpt-5.2",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are a strict JSON API. Only output valid JSON per the schema.",
          },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 90000,
      },
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from Near AI");
    }

    return safeJsonParse(content);
  } catch (error: any) {
    if (error.response) {
      console.error("Near AI API Error Details:", JSON.stringify(error.response.data, null, 2));
    }
    console.error("Failed to generate review:", error.message);
    throw error;
  }
}
