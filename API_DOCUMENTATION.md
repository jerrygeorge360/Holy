# Holy Backend API Documentation

This document provides the technical specifications for the Holy backend. Holy is designed with a **Separation of Concerns** principle: the Backend handles user data and persistence, while the **Shade Agent** handles autonomous blockchain and AI operations.

> [!TIP]
> **Interactive Docs**: You can explore and test these endpoints interactively via Swagger at `http://localhost:3001/api/docs`.

---

## Authentication

Holy uses **GitHub OAuth** for user authentication and a **Shared Secret** for Agent-to-Backend communication.

### 1. User Authentication (JWT)
Most `/api` endpoints require a Bearer token in the `Authorization` header.
- **Start OAuth**: `GET /auth/github`
- **Check Status**: `GET /auth/me` -> Returns `User` object.

### 2. Agent Authentication (Secret)
Endpoints used by the Shade Agent (payouts, status updates) require the `x-agent-secret` header.
- **Header**: `x-agent-secret: YOUR_MAINTAINER_SECRET`

---

## Repositories

### 1. Connect a Repo
- **URL**: `POST /api/repos/connect`
- **Auth**: Bearer JWT
- **Body**: `{ "repo": "owner/repo" }`
- **Action**: Installs a GitHub webhook and creates a database record.

### 2. Register NEAR Wallet (Phase 2)
- **URL**: `PUT /api/repos/{owner}/{repo}`
- **Auth**: Bearer JWT
- **Body**: `{ "nearWallet": "jerry.testnet" }`
- **Action**: Triggers the Shade Agent to register the repository on the NEAR smart contract.

### 3. Fetch GitHub Issues
- **URL**: `GET /api/repos/{owner}/{repo}/issues`
- **Auth**: Bearer JWT
- **Description**: Pulls open issues directly from GitHub to display in the dashboard.

---

## Bounties

### 1. Attach/Sync Bounty
- **URL**: `POST /api/bounty/attach`
- **Auth**: Bearer JWT OR Agent Secret
- **Body**:
```json
{
  "repo": "owner/repo",
  "issueNumber": 123,
  "prNumber": 456, // Optional (used for linking)
  "amount": "10.5" // Optional for linking
}
```
- **Note**: This endpoint is used by the Frontend (via JWT) and by the Agent (via Secret) when it detects a `/bounty` comment on GitHub.

### 2. Get Bounty for PR
- **URL**: `GET /api/bounty/{owner}/{repo}/pr/{prNumber}`
- **Auth**: Public or Agent Secret
- **Details**: When called with `x-agent-secret`, it also returns the Repo Owner's `githubToken` so the Agent can perform reviews.

### 3. Mark as Paid (Agent Only)
- **URL**: `POST /api/bounty/{id}/mark-paid`
- **Auth**: Agent Secret
- **Action**: Updates the database status of a bounty to `"paid"` after the NEAR transaction confirms.

---

## Shade Agent Interoperability

While the backend manages states, the Agent (running on port 3000) provides these endpoints:

- `POST /api/repo/register`: Registers a repo on the blockchain.
- `POST /api/bounty/release`: Manually triggers a NEAR release (requires `MAINTAINER_SECRET`).
- `GET /api/health`: Check TEE status and payout statistics.

---

## Error Reference

| Code | Meaning | Solution |
| :--- | :--- | :--- |
| `401` | Unauthorized | Missing logic or invalid Bearer token. |
| `403` | Forbidden | Invalid `x-agent-secret` or trying to modify a repo you don't own. |
| `424` | Failed Dependency | The Backend couldn't reach the Shade Agent or GitHub API. |
| `503` | Service Unavailable | Check if the Shade Agent is running on port 3000. |

---
**Document Version: 2.1**
