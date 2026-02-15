# Holy

Open source code review automation and bounty platform for GitHub, powered by LLMs and the NEAR blockchain.

## Overview

Holy is a backend API for managing GitHub repository connections, bounties, and review criteria. It integrates with a separate Shade Agent service for LLM-powered code review and NEAR blockchain payouts.

## Repository Structure

- backend/ — API server and data store
- shadeagent/shade-agent-v2/ — Shade agent + agent contract
- frontend/ — placeholder (Next.js)

## Architecture

```
		+-------------------+         +-------------------+         +-------------------+
		|                   |         |                   |         |                   |
		|    GitHub PRs     +-------->+     Holy API      +-------->+   Shade Agent     |
		|                   | Webhook |                   |  Proxy  |  (LLM + NEAR)     |
		+-------------------+         +-------------------+         +-------------------+
```

1. Maintainers connect repos and install the webhook
2. PRs trigger webhook events to Holy backend
3. Backend proxies criteria requests to the Shade Agent
4. Bounties are attached to PRs and paid out on merge

## Key Features

- Connect GitHub repositories and install webhooks
- Attach bounties to PRs
- Manage review criteria (proxied to Shade Agent)
- NEAR wallet registration (lazy, on demand)
- GitHub OAuth authentication

## Main Endpoints

- **Auth**
	- `GET /auth/github` — Start GitHub OAuth
	- `GET /auth/github/callback` — OAuth callback
	- `GET /auth/me` — Current user

- **Repositories**
	- `POST /repos/connect` — Connect repo + install webhook
	- `GET /repos/me` — List connected repos
	- `PUT /repos/:owner/:repo` — Add NEAR wallet (lazy contract registration)
	- `DELETE /repos/:owner/:repo` — Disconnect repo

- **Bounties**
	- `POST /bounty/attach` — Attach bounty to PR
	- `GET /bounty/:owner/:repo` — List repo bounties
	- `GET /bounty/:owner/:repo/pr/:prNumber` — Agent lookup on merge
	- `POST /bounty/:id/mark-paid` — Agent marks bounty as paid
	- `POST /bounty/release` — Manual bounty release (owner-only)
	- `GET /bounty/history` — Payout history

- **Criteria**
	- `GET /criteria/:owner/:repo` — Get review criteria (proxied to Shade Agent)
	- `PUT /criteria/:owner/:repo` — Update review criteria (proxied to Shade Agent)

- **Preferences**
	- `POST /preferences` — Set repository preferences
	- `GET /preferences` — Get preferences by userId or repoId
	- `DELETE /preferences/:id` — Delete preferences

See backend/README.md for detailed API documentation and example payloads.

## Setup

### Requirements
- Node.js 18+
- PostgreSQL

### Environment
Create a `.env` file:

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
