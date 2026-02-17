# Holy Backend: The Single Source of Truth

The Holy backend is the central management API for the Holy protocol. It coordinates repository connections, stores bounty data, and manages the link between GitHub users and the Shade Agent.

## Core Responsibilities

- **Authentication**: Handles GitHub OAuth and issues JWTs for the user dashboard.
- **Data Persistence**: Stores users, connected repositories, bounty records, and AI criteria in PostgreSQL.
- **Repository Integration**: Automatically installs webhooks on GitHub repos when they are connected.
- **Agent Coordination**: Proxies request for AI criteria and provides the Shade Agent with security tokens and payout metadata.
- **Issue Discovery**: Pulls open GitHub issues to allow maintainers to proactively assign bounties before code is even written.

---

## Technical Stack

- **Runtime**: Node.js + Express (ESM)
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Git Integration**: Octokit

---

## Key Endpoints

### Auth
- **GET /auth/github**: Redirect to GitHub OAuth flow.
- **GET /auth/me**: Retrieve current user profile and session status.

### Repositories
- **POST /api/repos/connect**: Connect a new repository and install webhooks.
- **GET /api/repos/me**: List all repositories managed by the authenticated user.
- **GET /api/repos/:owner/:repo/issues**: Fetch open issues from GitHub for bounty assignment.
- **PUT /api/repos/:owner/:repo**: Set repository metadata (like the NEAR wallet for agent registration).

### Bounties
- **POST /api/bounty/attach**: Assign a bounty to a specific Issue or PR (used by frontend and synced by Agent).
- **GET /api/bounty/:owner/:repo/pr/:prNumber**: High-priority endpoint for Agent lookup during the merge flow.
- **POST /api/bounty/:id/mark-paid**: Update bounty status to "paid" (Agent-only auth).

---

## Environment Configuration

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/holy
SESSION_SECRET=your_session_secret
MAINTAINER_SECRET=shared_secret_with_agent

# GitHub App/OAuth (Production) or Token (Development)
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
GITHUB_TOKEN=your_personal_token_for_dev

SHADE_AGENT_URL=http://localhost:3000
PORT=3001
```

---

## Development Setup

1. **Install**: `npm install`
2. **Database**: 
   - Ensure PostgreSQL is running.
   - Run `npx prisma migrate dev` to setup schema.
3. **Run**: `npm run dev`

The API will be available at `http://localhost:3001`. You can view interactive documentation at `/api/docs`.

---

## License
MIT