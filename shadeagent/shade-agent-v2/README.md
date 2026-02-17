# Holy Shade Agent: Autonomous AI & Blockchain Worker

This service is the autonomous heart of the Holy protocol. It sits within a Trusted Execution Environment (TEE) to securely manage private keys, review code using high-context LLMs, and handle bounty payouts on the NEAR blockchain.

## Core Capabilities

- **Webhook Intelligence**: Listens for GitHub events (Pull Requests, Issues, Comments) and identifies actionable tasks.
- **AI Code Review**: Scans PR diffs against repository-specific maintainer guidelines to provide automated, structured feedback.
- **Bounty Management**: Detects bounty commands in GitHub comments and coordinates with the Holy Backend to sync states.
- **Trustless Payouts**: Automatically releases NEAR tokens from the Holy smart contract to contributors when a PR is merged.
- **Identity Mapping**: Detects and stores contributor NEAR wallets through slash commands in PR descriptions or comments.

## Feature Spotlight

### GitHub Slash Commands
The Shade Agent monitors comments for the following commands:
- **/bounty <amount>**: Sets or updates the NEAR bounty on an issue.
- **/link-wallet <near-id>**: Maps a GitHub user to their NEAR wallet for automated payouts.

### Automated PR Linking
When a Pull Request is opened, the Agent scans the description for issue references (e.g., "Fixes #123"). If a bounty exists on the referenced issue, the Agent automatically links that bounty to the PR and announces it to the contributor.

### TEE Security
When deployed to Phala TEE, the Agent provides:
- **Key Isolation**: The sponsor keys and agent identities are shielded from the host machine.
- **Tamper-Proof Execution**: Ensures that the review and payout logic haven't been modified.

---

## API Reference

### Health & Stats
- **GET /api/health**: Returns agent status, registration info, and aggregate payout statistics.

### Repository Management
- **POST /api/repo/register**: Manually register a repository and its maintainer on the NEAR contract.
  - Body: `{ "repo": "owner/repo", "maintainerNearId": "name.testnet" }`

### Bounty Operations
- **GET /api/bounty/:owner/:repo**: Fetch the current live bounty balance for a repository from the blockchain.
- **POST /api/bounty/release**: Manually trigger a bounty payout (secured with MAINTAINER_SECRET).
- **GET /api/bounty/history**: View the log of all payout attempts for the current session.

---

## Environment Configuration

Create a `.env` file with the following variables:

```env
# NEAR Configuration
AGENT_CONTRACT_ID=      # The Shade Agent contract ID
SPONSOR_ACCOUNT_ID=     # Account used to fund/sponsor transactions
SPONSOR_PRIVATE_KEY=    # Private key for the sponsor account

# GitHub & Security
GITHUB_WEBHOOK_SECRET=  # Secret for validating GitHub webhooks
MAINTAINER_SECRET=      # Secret used to authorize requests from the Holy Backend

# AI Models
GROQ_API_KEY=           # Optional: For high-speed reviews
OPENAI_KEY=             # Optional: For GPT-4 based reviews
NEAR_AI_API_KEY=        # Optional: For NEAR AI context

# Backend Link
BACKEND_URL=http://localhost:3001
```

---

## Deployment & Setup

### Local Development
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. The Agent will automatically attempt to fund itself (0.2 NEAR) and register its identity on-chain.

### TEE Deployment (Phala Cloud)
The Agent is optimized for deployment via Phala Cloud.
1. Configure `deployment.yaml` (set `environment: TEE`).
2. Run `docker login`.
3. Build and push the image using the Shade CLI.

---

## Architecture Note
The Shade Agent is designed to be stateless regarding user data—it fetches necessary metadata (like GitHub tokens and bounty criteria) from the Holy Backend on-demand using its secret identity. This ensures a clean separation between the "Brains" (Backend) and the "Hands" (Agent).
