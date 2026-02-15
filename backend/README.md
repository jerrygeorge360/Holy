# Holy Backend

The Holy backend is a REST API for managing GitHub repository connections, bounties, review criteria, and preferences. It serves as the single entry point for the frontend and proxies relevant calls to the Shade Agent.

**What the backend does:**
- Handles GitHub OAuth + JWT auth
- Stores users, repositories, bounties, criteria, and preferences in PostgreSQL
- Installs GitHub webhooks on connected repositories
- Proxies Shade Agent operations (criteria sync, bounty payout)

**What the Shade Agent does (separate service):**
- Receives GitHub webhook events for pull requests (opened, synchronized, reopened, merged)
- Evaluates pull requests against repository criteria
- Provides advisory code review feedback using LLMs
- Posts review comments to GitHub PRs
- Coordinates and triggers NEAR bounty payouts when PRs are merged and criteria are met

## Stack

- Node.js + Express (ESM)
- TypeScript
- Prisma + PostgreSQL
- Octokit (GitHub API)

## Data model (simplified)

- User → Repositories
- Repository → Bounties (PR scoped)
- Repository → Criteria
- User → Preferences

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
- `GET /auth/github` — Start GitHub OAuth
- `GET /auth/github/callback` — OAuth callback
- `GET /auth/me` — Current user

### Repositories
- `POST /repos/connect` — Connect repo + install webhook
- `GET /repos/me` — List connected repos
- `PUT /repos/:owner/:repo` — Add NEAR wallet (lazy contract registration)
- `DELETE /repos/:owner/:repo` — Disconnect repo

### Bounties
- `POST /bounty/attach` — Attach bounty to PR
- `GET /bounty/:owner/:repo` — List repo bounties
- `GET /bounty/:owner/:repo/pr/:prNumber` — Agent lookup on merge
- `POST /bounty/:id/mark-paid` — Agent marks bounty as paid
- `POST /bounty/release` — Manual bounty release (owner-only)
- `GET /bounty/history` — Payout history

### Criteria
- `GET /criteria/:owner/:repo` — Get review criteria (proxied to Shade Agent)
- `PUT /criteria/:owner/:repo` — Update review criteria (proxied to Shade Agent)

### Preferences
- `POST /preferences` — Set repository preferences
- `GET /preferences` — Get preferences by userId or repoId
- `DELETE /preferences/:id` — Delete preferences

## Example: Attach Bounty

POST `/bounty/attach`

```json
{
  "owner": "octocat",
  "repo": "hello-world",
  "prNumber": 42,
  "amount": "10.0",
  "currency": "NEAR"
}
```

## Example: Update Criteria

PUT `/criteria/octocat/hello-world`

```json
{
  "criteria": [
    "Code must be well-documented",
    "Tests must cover new features"
  ]
}
```

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

## License

MIT