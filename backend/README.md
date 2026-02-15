# Holy Backend

The Holy backend is a REST API that stores and manages repos, reviews, issues, bounties, and user data. It is the single entry point for the frontend and proxies relevant calls to the Shade Agent.

**What the backend does:**
- Handles GitHub OAuth + JWT auth
- Stores users, repositories, reviews, issues, preferences, and bounties in PostgreSQL
- Installs GitHub webhooks on connected repositories
- Proxies Shade Agent operations (bounty release, criteria sync)
- Manages data export and privacy controls (inspect/export/delete/revoke)

**What the Shade Agent does (separate service):**
- Receives GitHub webhook events (PR opened/sync/reopen/merge)
- Generates advisory code review comments
- Posts review feedback to GitHub PRs
- Releases bounties on merged PRs when a bounty is attached

## Backend Features

- REST API for review data management
- GitHub repository metadata ingestion
- Review storage with advisory feedback (summary/issues/suggestions)
- Bounty attachment and payout tracking
- Repository lookup by full name (owner/repo) or UUID
- User-owned memory: inspect/export/delete/revoke
- Data export pipeline (CSV, JSON)
- Notification storage and management

## Stack

- Node.js + Express (ESM)
- TypeScript
- Prisma + PostgreSQL
- Octokit (GitHub API)

## Data model (simplified)

- User → Repositories → Reviews → Issues
- Repository → Bounties (issue/PR scoped)
- User → Preferences
- Review → Notifications
- Repository: stores GitHub repo metadata with `fullName` (unique) for easy lookup
- Review: includes `approved` (boolean), `score` (0-100), `suggestions` (JSON array), and optional `commitSha`

## Architecture

```mermaid
flowchart TD
    subgraph ShadeAgent[Shade Agent - separate service]
        A[GitHub Webhook Listener]
        B[Groq LLM Reviewer]
        C[Post Comments to GitHub]
        D[Release NEAR Bounty on Merge]
    end

    subgraph Backend[Backend API]
        E[REST Endpoints]
        F[Prisma ORM]
        G[(PostgreSQL)]
    end

    subgraph GitHub
        H[Pull Requests]
    end

    subgraph Users
        I[Inspect/Export/Delete Data]
    end

    H -->|Webhook Events| A
    A --> B
    B --> C
    B -->|POST /reviews| E
    B --> D
    E --> F
    F --> G
    I -->|API Calls| E
    E -->|GET /repos/:user| H
```

The backend is the system of record. The Shade Agent is a separate service that posts review feedback and triggers payouts on merge.

## Endpoints

### Auth
- GET /auth/github — Start GitHub OAuth
- GET /auth/github/callback — OAuth callback
- GET /auth/me — Current user

### Repositories
- POST /repos/connect — Connect repo + install webhook
- GET /repos/me — List connected repos
- PUT /repos/:owner/:repo — Add NEAR wallet (lazy contract registration)
- DELETE /repos/:owner/:repo — Disconnect repo

### Reviews
- POST /reviews — Submit review (accepts `repoFullName` or `repoId`)
- GET /reviews/:repoId — Get reviews for repository
- GET /reviews — Query reviews by userId
- DELETE /reviews/:id — Delete review

### Issues
- GET /issues — Query issues by userId
- DELETE /issues/:issueId — Delete issue

### Bounties
- POST /bounty/attach — Attach bounty to issue or PR
- GET /bounty/:owner/:repo — List repo bounties
- GET /bounty/:owner/:repo/pr/:prNumber — Agent lookup on merge
- POST /bounty/:id/mark-paid — Agent marks bounty as paid
- POST /bounty/release — Manual bounty release (owner-only)
- GET /bounty/history — Payout history

### Preferences
- POST /preferences — Set repository preferences
- GET /preferences — Get preferences by userId or repoId
- DELETE /preferences/:id — Delete preferences

### Notifications
- POST /notifications — Create notification
- GET /notifications — Query notifications by userId
- PUT /notifications/:id — Update notification status

### Memory (export)
- GET /export/reviews?userId=&format=csv|json
- GET /export/issues?userId=&format=csv|json
- GET /export/preferences?userId=&format=csv|json

## Example

POST /reviews

The backend accepts reviews from the Shade Agent with repository lookup by full name:

```json
{
	"repoFullName": "owner/repo",
	"commitSha": "abc123",
	"prNumber": 42,
	"summary": "Code looks good with minor suggestions.",
    "approved": true,
    "score": 85,
	"suggestions": [
		"Consider adding error handling in line 42",
		"Add unit tests for the new function"
	],
	"issues": [
		{ "title": "Missing error handling", "details": "Function may throw unhandled exception", "severity": "medium" }
	],
	"source": "shade-agent",
	"agent": "holy-groq-reviewer"
}
```

Alternatively, use `repoId` instead of `repoFullName` if you have the UUID.

## Setup

### Requirements
- Node.js 18+
- PostgreSQL

### Environment
Create a .env file:

```
DATABASE_URL=postgresql://user:password@localhost:5432/nyx
GITHUB_TOKEN=your_github_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret
SHADE_AGENT_URL=http://localhost:3000
MAINTAINER_SECRET=shared_secret_for_agent_calls
PORT=3001
```

### Install
```
npm install
```

### Prisma
```
./node_modules/.bin/prisma generate
```

### Run
```
npm run dev
```


## Privacy
Memory can be inspected, exported, deleted, and revoked. Revocation prevents future storage and clears existing data for the user.