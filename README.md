

# Holy: AI-Powered Code Review & Bounty Platform

Holy is a decentralized, AI-driven code review and bounty platform built on the NEAR blockchain. It automates code reviews, bounty management, and instant payouts for open-source projects.

---

## Features

- **AI Code Reviews**: Automated, customizable reviews for every PR.
- **Bounty Automation**: Attach bounties to issues/PRs and pay contributors instantly on merge.
- **NEAR Blockchain Integration**: Trustless, on-chain payouts.
- **GitHub Slash Commands**: `/bounty <amount>`, `/link-wallet <wallet>` for easy bounty and wallet management.
- **Secure Shade Agent**: Runs in a Trusted Execution Environment (TEE) for key isolation and tamper-proof payouts.

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL

### 1. Clone & Install

```bash
git clone https://github.com/jerrygeorge360/Holy.git
cd Holy

# Backend
cd backend && npm install

# Frontend
cd ../frontend/nyx-frontend && npm install

# Shade Agent
cd ../../shadeagent/shade-agent-v2 && npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` in each of:
- `backend/`
- `frontend/nyx-frontend/`
- `shadeagent/shade-agent-v2/`

Edit `backend/.env.local`:
```
SHADE_AGENT_URL=http://localhost:4002
```
Edit `shadeagent/shade-agent-v2/.env.local` as needed for NEAR and backend URLs.

### 3. Start All Services


#### Start Shade Agent
```bash
cd shadeagent/shade-agent-v2
npm run dev
# Runs on http://localhost:4002
```

#### Expose Shade Agent with ngrok
You need to expose your local Shade Agent to the internet so GitHub webhooks can reach it. Use [ngrok](https://ngrok.com/) for this:

```bash
ngrok http 3000
# Copy the https://...ngrok-free.app URL from the output
```

#### Update Backend to Use ngrok URL
Edit `backend/.env.local` and set:
```
SHADE_AGENT_URL=<your-ngrok-url>
# Example:
# SHADE_AGENT_URL=https://xxxx-xxx-xxx-xxx.ngrok-free.app
```

> **Note:**
> - Always update `SHADE_AGENT_URL` in `backend/.env.local` to the latest ngrok URL each time you restart ngrok.
> - Edit `shadeagent/shade-agent-v2/.env.local` as needed for NEAR and backend URLs.

#### Start Backend
```bash
cd ../../backend
npm run dev
# Runs on http://localhost:3001
```

#### Start Frontend
```bash
cd ../frontend/nyx-frontend
npm run dev
# Runs on http://localhost:3002
```

---

## Usage

1. Connect your GitHub repo via the dashboard.
2. Fund your repo's bounty pool (see dashboard instructions).
3. Attach bounties to issues or PRs using slash commands or the dashboard.
4. Contributors link their NEAR wallet with `/link-wallet <wallet>` in a PR or comment.
5. When a PR is merged, the agent reviews, then pays out the bounty automatically.

---


## Directory Structure

- `backend/` — Express API, Prisma, PostgreSQL
- `frontend/nyx-frontend/` — Next.js dashboard
- `shadeagent/shade-agent-v2/` — Shade Agent (AI, blockchain, TEE)

---

## Docs & References

- [API Documentation](API_DOCUMENTATION.md)
- [Shade Agent README](shadeagent/shade-agent-v2/README.md)
- [Backend README](backend/README.md)

---

**Maintained by jerrygeorge360**
