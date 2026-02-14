import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../utils/httpError.js";

export interface IssueInput {
  title: string;
  details?: string;
  severity?: string;
  source?: string;
}

export interface ReviewInput {
  repoId?: string;
  repoFullName?: string;
  commitSha?: string | null;
  prNumber?: number;
  summary: string;
  approved?: boolean;
  score?: number;
  issues: Prisma.JsonValue;
  suggestions?: Prisma.JsonValue;
  source?: string;
  agent?: string;
  issuesList: IssueInput[];
}

export type ReviewWithIssues = Prisma.ReviewGetPayload<{
  include: { issuesList: true; repository: true };
}>;

const ensureRepoExists = async (repoId?: string, repoFullName?: string) => {
  if (!repoId && !repoFullName) {
    throw new HttpError(400, "repoId or repoFullName is required");
  }

  const repo = repoId
    ? await prisma.repository.findUnique({
        where: { id: repoId },
        include: { owner: true },
      })
    : await prisma.repository.findUnique({
        where: { fullName: repoFullName as string },
        include: { owner: true },
      });
  if (!repo) {
    throw new HttpError(404, "Repository not found");
  }
  if (repo.owner.memoryRevokedAt) {
    throw new HttpError(403, "User has revoked memory storage");
  }
  return repo;
};

export const addReview = async (input: ReviewInput): Promise<ReviewWithIssues> => {
  const repo = await ensureRepoExists(input.repoId, input.repoFullName);

  const [review] = await prisma.$transaction([
    prisma.review.create({
      data: {
        repoId: repo.id,
        commitSha: input.commitSha ?? null,
        prNumber: input.prNumber ?? null,
        summary: input.summary,
        approved: input.approved ?? null,
        score: input.score ?? null,
        issues: (input.issues ?? []) as Prisma.InputJsonValue,
        suggestions: (input.suggestions ?? []) as Prisma.InputJsonValue,
        source: input.source ?? null,
        agent: input.agent ?? null,
      },
    }),
  ]);

  if (input.issuesList.length > 0) {
    await prisma.issue.createMany({
      data: input.issuesList.map((issue) => ({
        repoId: repo.id,
        reviewId: review.id,
        commitSha: input.commitSha ?? null,
        title: issue.title,
        details: issue.details ?? null,
        severity: issue.severity ?? null,
        source: issue.source ?? null,
      })),
    });
  }

  return prisma.review.findUniqueOrThrow({
    where: { id: review.id },
    include: { issuesList: true, repository: true },
  });
};

export const getReviewsByRepo = async (repoId: string): Promise<ReviewWithIssues[]> => {
  return prisma.review.findMany({
    where: { repoId },
    include: { issuesList: true, repository: true },
    orderBy: { createdAt: "desc" },
  });
};
