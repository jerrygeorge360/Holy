# Shade Agent — Autonomous Code Review + Bounty Payouts

This agent listens for GitHub pull request events, performs automated code reviews using an LLM, posts review comments, and (when approved) releases NEAR token bounties to contributors. It runs as a Shade Agent using the NEAR Shade Agent Framework (`shade-agent-js`).

## What it does

- **GitHub Webhook Listener**: Receives `pull_request` events and fetches the PR diff.
- **Automated Review**: Sends diff + maintainer criteria to an LLM and returns a structured review.
- **GitHub Commenting**: Posts the review back to the PR as a markdown comment.
- **Bounty Payouts**: Releases a NEAR bounty on approved reviews and logs payout attempts.
- **Criteria Management**: Maintainers can set custom review criteria per repo.

> Note: The AI never closes PRs. Maintainers decide whether to merge or close.

## Endpoints

### Health
- **GET** `/api/health`
	- Returns agent status and payout stats.

### Webhook
- **POST** `/api/webhook`
	- GitHub webhook listener for `pull_request` events.

### Criteria
- **POST** `/api/criteria`
	- Body: `{ repo: string, criteria: string, secret: string }`
	- Secured with `MAINTAINER_SECRET`.

### Bounty
- **GET** `/api/bounty/:owner/:repo`
	- Returns current bounty amount for the repo.
- **POST** `/api/bounty/release`
	- Body: `{ repo: string, contributorWallet: string, prNumber: number, secret: string }`
	- Releases bounty manually for testing.
- **GET** `/api/bounty/history`
	- Returns in-memory payout attempts for this session.

## Environment Variables

Required:

```
AGENT_CONTRACT_ID=
SPONSOR_ACCOUNT_ID=
SPONSOR_PRIVATE_KEY=

GITHUB_TOKEN=
GITHUB_WEBHOOK_SECRET=
GROQ_API_KEY=
MAINTAINER_SECRET=

TEST_CONTRIBUTOR_WALLET=contributor.testnet
```

## Running locally

1) Install dependencies:
- `npm install`

2) Copy and edit env file:
- `cp .env.example .env`

3) Start the agent:
- `npm run dev`

The server listens on port **3000** by default.

## Testing bounty flow in isolation

```bash
# Check bounty for a repo
curl http://localhost:3000/api/bounty/owner/repo-name

# Manually trigger a release
curl -X POST http://localhost:3000/api/bounty/release \
	-H "Content-Type: application/json" \
	-d '{"repo": "owner/repo", "contributorWallet": "contributor.testnet", "prNumber": 1, "secret": "your-secret"}'

# Check payout history
curl http://localhost:3000/api/bounty/history
```

## Notes

- The bounty service is fully decoupled from the review logic.
- Payout failures never block the review flow.
- All payout attempts are logged in-memory for quick inspection.
