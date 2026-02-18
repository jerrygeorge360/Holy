import { API_BASE_URL } from "./config";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("holy_token");
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new ApiError(body.error || `API Error ${res.status}`, res.status);
    }

    return res.json();
}

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

/* ------------------------------------------------------------------ */
/*  Types — exact mirrors of backend Prisma models + enrichments      */
/* ------------------------------------------------------------------ */

/** Matches Prisma Preference model */
export interface Preference {
    id: string;
    repoId: string;
    userId: string;
    settings: Record<string, unknown>;
    reason: string | null;
    source: string | null;
    createdAt: string;
    updatedAt: string;
}

/** Matches Prisma Repository model (as returned by /api/repos/connect) */
export interface Repository {
    id: string;
    githubId: number;
    name: string;
    fullName: string;
    url: string;
    webhookId: number | null;
    nearWallet: string | null;
    createdAt: string;
    ownerId: string;
    preferences?: Preference[];
}

/** Enriched repo returned by GET /api/repos/me (has bountyBalance from Shade Agent) */
export interface EnrichedRepository extends Repository {
    bountyBalance: string | number | null;
}

/** Matches /auth/me response — includes nested repositories with preferences */
export interface User {
    id: string;
    username: string;
    email: string | null;
    repositories: {
        id: string;
        name: string;
        fullName: string;
        url: string;
        nearWallet: string | null;
        preferences: Preference[];
    }[];
}

/** Matches Prisma Bounty model */
export interface Bounty {
    id: string;
    repoId: string;
    issueNumber: number | null;
    prNumber: number | null;
    amount: string;
    status: string | null;
    createdAt: string;
    updatedAt: string;
    repository?: {
        fullName: string;
        url: string;
    };
}

/** GitHub issue as proxied by GET /api/repos/:owner/:repo/issues */
export interface GitHubIssue {
    number: number;
    title: string;
    html_url: string;
    state: string;
    user: { login: string; avatar_url: string };
    labels: { name: string; color: string }[];
    created_at: string;
}

/** Response from PUT /api/repos/:owner/:repo */
export interface UpdateRepoResponse {
    message: string;
    nearWallet: string;
    contractRegistration: Record<string, unknown>;
}

/** Response from POST /api/repos/:owner/:repo/fund */
export interface FundingInstructions {
    message: string;
    instructions: {
        method: string;
        contractId: string;
        args: { repo_id: string };
        deposit: string;
        maintainerAccount: string;
    };
    cliExample: string;
}

/* ------------------------------------------------------------------ */
/*  Auth                                                              */
/* ------------------------------------------------------------------ */

/** GET /auth/me — returns user profile with nested repositories */
export async function getMe(): Promise<User> {
    return apiFetch<User>("/auth/me");
}

/** POST /auth/logout */
export async function logout(): Promise<{ message: string }> {
    return apiFetch<{ message: string }>("/auth/logout", { method: "POST" });
}

/* ------------------------------------------------------------------ */
/*  Repositories                                                      */
/* ------------------------------------------------------------------ */

/** GET /api/repos/me — repos enriched with bountyBalance from Shade Agent */
export async function getMyRepos(): Promise<EnrichedRepository[]> {
    return apiFetch<EnrichedRepository[]>("/api/repos/me");
}

/** POST /api/repos/connect — installs webhook, creates repo in DB */
export async function connectRepo(
    repo: string,
    criteria?: Record<string, unknown>
): Promise<Repository> {
    return apiFetch<Repository>("/api/repos/connect", {
        method: "POST",
        body: JSON.stringify({ repo, criteria }),
    });
}

/** PUT /api/repos/:owner/:repo — sets NEAR wallet + registers on contract */
export async function updateRepo(
    owner: string,
    repoName: string,
    data: { nearWallet: string }
): Promise<UpdateRepoResponse> {
    return apiFetch<UpdateRepoResponse>(`/api/repos/${owner}/${repoName}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

/** DELETE /api/repos/:owner/:repo — removes webhook + deletes repo */
export async function deleteRepo(
    owner: string,
    repoName: string
): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`/api/repos/${owner}/${repoName}`, {
        method: "DELETE",
    });
}

/** GET /api/repos/:owner/:repo/issues — open GitHub issues (not PRs) */
export async function getRepoIssues(
    owner: string,
    repoName: string
): Promise<GitHubIssue[]> {
    return apiFetch<GitHubIssue[]>(`/api/repos/${owner}/${repoName}/issues`);
}

/** GET /api/repos/:owner/:repo/bounty — bounty balance from Shade Agent */
export async function getRepoBountyBalance(
    owner: string,
    repoName: string
): Promise<Record<string, unknown>> {
    return apiFetch<Record<string, unknown>>(`/api/repos/${owner}/${repoName}/bounty`);
}

/** POST /api/repos/:owner/:repo/fund — get funding instructions */
export async function getFundingInstructions(
    owner: string,
    repoName: string
): Promise<FundingInstructions> {
    return apiFetch<FundingInstructions>(`/api/repos/${owner}/${repoName}/fund`, {
        method: "POST",
    });
}

/* ------------------------------------------------------------------ */
/*  Bounties                                                          */
/* ------------------------------------------------------------------ */

/** GET /api/bounty/:owner/:repo — list all bounties for a repo */
export async function getRepoBounties(
    owner: string,
    repoName: string
): Promise<{ bounties: Bounty[] }> {
    return apiFetch<{ bounties: Bounty[] }>(`/api/bounty/${owner}/${repoName}`);
}

/** POST /api/bounty/attach — attach bounty to issue or PR */
export async function attachBounty(data: {
    repo: string;
    issueNumber?: number;
    prNumber?: number;
    amount: string;
}): Promise<{ bounty: Bounty }> {
    return apiFetch<{ bounty: Bounty }>("/api/bounty/attach", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/** POST /api/bounty/release — trigger manual bounty release via Shade Agent */
export async function releaseBounty(data: {
    repo: string;
    contributorWallet: string;
    prNumber: number;
    amount?: string;
}): Promise<Record<string, unknown>> {
    return apiFetch<Record<string, unknown>>("/api/bounty/release", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/** GET /api/bounty/history — payout history from Shade Agent */
export async function getBountyHistory(): Promise<Record<string, unknown>> {
    return apiFetch<Record<string, unknown>>("/api/bounty/history");
}

/** GET /api/bounty/explore — list all open bounties (Public) */
export async function getExploreBounties(): Promise<{ bounties: Bounty[] }> {
    return apiFetch<{ bounties: Bounty[] }>("/api/bounty/explore");
}

/* ------------------------------------------------------------------ */
/*  Criteria                                                          */
/* ------------------------------------------------------------------ */

/** GET /api/criteria/:owner/:repo — get review criteria for a repo */
export async function getCriteria(
    owner: string,
    repoName: string
): Promise<Record<string, unknown>> {
    return apiFetch<Record<string, unknown>>(`/api/criteria/${owner}/${repoName}`);
}

/** PUT /api/criteria/:owner/:repo — update review criteria */
export async function updateCriteria(
    owner: string,
    repoName: string,
    criteria: Record<string, unknown>
): Promise<Record<string, unknown>> {
    return apiFetch<Record<string, unknown>>(`/api/criteria/${owner}/${repoName}`, {
        method: "PUT",
        body: JSON.stringify({ criteria }),
    });
}
