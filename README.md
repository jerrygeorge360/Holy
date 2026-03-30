<div align="center">

<!-- PLACEHOLDER: Replace with your banner image (1280×640px recommended) -->
![Holy Banner](./assets/banner.png)

# Holy

### Private. Secure. Unstoppable.

An autonomous AI that reviews every pull request and triggers on-chain bounty payments the moment a PR is merged — running inside a Trusted Execution Environment, backed by NEAR Protocol, and integrated directly into GitHub.

[![NEAR](https://img.shields.io/badge/NEAR-Protocol-00C08B?style=flat-square)](https://near.org)
[![TEE](https://img.shields.io/badge/Shade_Agent-TEE_Secured-6B48FF?style=flat-square)](https://phala.network)
[![Groq](https://img.shields.io/badge/AI-Groq_%7C_OpenAI_%7C_DeepSeek-FF6B35?style=flat-square)](https://groq.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-58.7%25-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Rust](https://img.shields.io/badge/Rust-31.9%25-CE4A00?style=flat-square&logo=rust)](https://www.rust-lang.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

[🚀 Live Demo](https://holy-frontend-ctqw.onrender.com) · [📺 Watch Demo Video](#-demo-video) · [📖 API Docs](./API_DOCUMENTATION.md)

</div>

---

## 📺 Demo Video

<!-- PLACEHOLDER: Embed your demo video here -->
<!-- Option A — YouTube thumbnail link (replace VIDEO_ID): -->
<!-- [![Watch the demo](https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=VIDEO_ID) -->

<!-- Option B — Raw video file: -->
<!-- <video src="./assets/demo.mp4" controls width="100%"></video> -->

> 📹 **Demo video coming soon.** Check back here or visit the submission page.

---

## Table of Contents

1. [Overview](#1-overview)
2. [How It Works](#2-how-it-works)
3. [Architecture](#3-architecture)
4. [Key Features](#4-key-features)
5. [Tech Stack](#5-tech-stack)
6. [GitHub Slash Commands](#6-github-slash-commands)
7. [API Reference](#7-api-reference)
8. [Setup & Installation](#8-setup--installation)
9. [Testing the Flow](#9-testing-the-flow)
10. [Repository Structure](#10-repository-structure)
11. [Security Notes](#11-security-notes)

---

## 1. Overview

<!-- PLACEHOLDER: Replace with a product screenshot or overview diagram -->
![Holy Overview](./assets/overview.png)

Holy bridges open-source contribution and fair compensation. It acts as a fully autonomous agent that monitors a GitHub repository, posts deep AI-driven code reviews on every PR, and releases NEAR bounty payments the instant a maintainer merges — with zero manual intervention at any step.

The core value: **maintainers set the rules once, and Holy enforces them forever.**

```
Bounty attached to issue
      ↓
Developer opens PR fixing that issue
      ↓
Holy reviews the code automatically
      ↓
Maintainer merges
      ↓
NEAR payout fires instantly — no clicks, no delays
```

---

## 2. How It Works

<!-- PLACEHOLDER: Replace with a step-by-step flow illustration -->
![How It Works](./assets/how-it-works.png)

### Maintainer Flow

| Step | Action | What Happens |
|------|--------|--------------|
| **1 — Connect** | Link your GitHub repo via the dashboard | Holy registers a webhook on your repository |
| **2 — Fund** | Deposit NEAR into your repo's bounty pool | Funds are held in the trustless NEAR smart contract |
| **3 — Attach Bounty** | Comment `/bounty 10` on an issue or PR | Holy records the bounty onchain and posts a bounty notice |

### Contributor Flow

| Step | Action | What Happens |
|------|--------|--------------|
| **1 — Discover** | Open a PR referencing "Fixes #123" | Holy detects the link and announces the bounty amount in the PR |
| **2 — Link Wallet** | Comment `/link-wallet name.testnet` | Holy records the contributor's NEAR wallet address |
| **3 — Get Reviewed** | Push commits to the PR | Holy posts an AI-powered review with Groq / OpenAI / DeepSeek |
| **4 — Get Paid** | Maintainer merges the PR | Holy triggers the NEAR payout automatically — funds arrive in seconds |

---

## 3. Architecture

### The Triple Handshake

Holy operates through three coordinated layers. No single layer holds all the power — the backend manages state, the Shade Agent acts, and NEAR Protocol settles.

![The Triple Handshake](./assets/The%20Triple%20Handshake%20process%20flow.png)


### Data Flow Detail

![Data Flow Detail](./assets/Bounty%20system%20data%20flow%20infographic.png)


---

## 4. Key Features

<!-- PLACEHOLDER: Replace with a features grid screenshot -->
![Key Features](./assets/features.png)

### Autonomous AI Reviews

Holy integrates with **Groq**, **OpenAI**, and **DeepSeek** to post fast, high-context code reviews on every PR. Review criteria are configurable per repository — maintainers define what matters.

The agent automatically detects when a PR carries a bounty and includes the amount prominently in the review comment, so contributors always know what they are working toward.

### Blockchain-Powered Bounties

Funds live in a **NEAR smart contract**, not a Holy server. Payouts only release when a maintainer merges a PR — the agent's signature is the trigger, and the contract is the enforcer. No escrow service, no trust assumption.

Multi-bounty support means maintainers can attach bounties to both **Issues** (attract talent before work starts) and directly to **PRs** (reward a specific contribution). PRs containing `Fixes #123` are automatically linked to the corresponding issue bounty.

### GitHub Slash Commands

Holy is operated from inside GitHub comments — no dashboard required for day-to-day management:

| Command | Where | Effect |
|---------|-------|--------|
| `/bounty <amount>` | Issue or PR comment | Attaches a NEAR bounty to that issue/PR |
| `/link-wallet <wallet.testnet>` | PR or any comment | Links the commenter's NEAR wallet for payout |

### Trusted Execution Environment

The Shade Agent runs inside a **Phala TEE**. Private keys never leave the enclave. Payout logic is tamper-proof and verifiable. This means neither Holy nor any infrastructure provider can intercept or redirect funds.

---

## 5. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Node.js + Express + Prisma | API server, webhook handler, PostgreSQL data layer |
| **Shade Agent** | TypeScript + Phala TEE | Autonomous AI worker, NEAR transaction signer, webhook processor |
| **Smart Contract** | Rust on NEAR Protocol | Trustless bounty vault — holds and releases funds |
| **AI Models** | Groq + OpenAI + DeepSeek | Code review generation, context-aware PR analysis |
| **Frontend** | Next.js (App Router) | Maintainer dashboard — repo management, bounty pool, activity feed |
| **Database** | PostgreSQL via Prisma | Repo metadata, bounty state, contributor wallet registry |
| **Infrastructure** | Docker + docker-compose + ngrok | Full-stack local development and production deployment |

---

## 6. GitHub Slash Commands

Holy listens to GitHub webhook `issue_comment` events and responds to slash commands in real time.

### `/bounty <amount>`

Post in any issue or PR comment. Holy attaches the specified NEAR amount as a bounty and confirms with a comment. The bounty is recorded in both the backend and the smart contract.

```
/bounty 5
→ 💰 Bounty of 5 NEAR attached to this issue.
```

### `/link-wallet <wallet>`

Post in any PR comment. Holy records the contributor's NEAR wallet address. When the PR is merged, the payout goes directly to this address.

```
/link-wallet alice.testnet
→ ✅ Wallet alice.testnet linked to your account.
```

---

## 7. API Reference

> Full documentation: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/repos/connect` | User JWT | Connect a GitHub repository to Holy |
| `PUT` | `/api/repos/:owner/:repo` | User JWT | Update repo settings, link contributor wallet |
| `POST` | `/api/bounty/attach` | User JWT / Agent Secret | Attach a bounty to an issue or PR |
| `GET` | `/api/repos/:owner/:repo/issues` | User JWT | List issues with attached bounties |
| `POST` | `/api/bounty/release` | Agent Secret | Manually trigger a bounty release |

---

## 8. Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL
- [ngrok](https://ngrok.com/) (for local webhook testing)

### Step 1 — Clone & Install

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

### Step 2 — Configure Environment

Copy `.env.example` to `.env.local` in each of the three service directories:

```bash
cp backend/.env.example backend/.env.local
cp frontend/nyx-frontend/.env.example frontend/nyx-frontend/.env.local
cp shadeagent/shade-agent-v2/.env.example shadeagent/shade-agent-v2/.env.local
```

Key variables:

| Variable | Location | Description |
|----------|----------|-------------|
| `GH_WEBHOOK_SECRET` | `backend/`, `shadeagent/` | Shared secret for webhook verification |
| `MAINTAINER_SECRET` | `backend/` | Secret for agent-to-backend communication |
| `NEAR_ACCOUNT_ID` | `shadeagent/` | The agent's NEAR account for signing payouts |
| `SHADE_AGENT_URL` | `backend/` | URL of the running Shade Agent (ngrok URL locally) |

### Step 3 — Start Services

#### Start the Shade Agent

```bash
cd shadeagent/shade-agent-v2
npm run dev
# Runs on http://localhost:4002
```

#### Expose the Shade Agent via ngrok

GitHub webhooks need a public URL to reach your local Shade Agent:

```bash
ngrok http 3000
# Copy the https://xxxx.ngrok-free.app URL
```

Update `backend/.env.local`:
```env
SHADE_AGENT_URL=https://xxxx.ngrok-free.app
```

> **Note:** Update `SHADE_AGENT_URL` each time you restart ngrok — the URL changes on every session.

#### Start the Backend

```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

#### Start the Frontend

```bash
cd frontend/nyx-frontend
npm run dev
# Runs on http://localhost:3002
```

### Or: Run with Docker

```bash
docker-compose up --build -d
```

---

## 9. Testing the Flow

### Manual API Testing

| Step | Action | Endpoint |
|------|--------|----------|
| 1 | Connect repo | `POST /api/repos/connect` |
| 2 | Link contributor wallet | `PUT /api/repos/:owner/:repo` |
| 3 | Attach a bounty | `POST /api/bounty/attach` |
| 4 | List issues with bounties | `GET /api/repos/:owner/:repo/issues` |
| 5 | Manually release a bounty | `POST /api/bounty/release` |

### Live GitHub Testing

1. Comment `/bounty 0.5` on any GitHub issue — Holy syncs the bounty to the backend and posts a confirmation
2. Open a PR with "Fixes #IssueNumber" — Holy announces the bounty and posts an AI review
3. Comment `/link-wallet name.testnet` — Holy records the payout wallet
4. Merge the PR — the NEAR payout triggers automatically

---

## 10. Repository Structure

```
Holy/
├── backend/
│   ├── src/
│   │   ├── routes/               # Express API routes
│   │   ├── services/             # Business logic
│   │   └── middleware/           # Auth, validation
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── .env.example
│   └── package.json
├── frontend/
│   └── nyx-frontend/
│       ├── app/                  # Next.js App Router pages
│       ├── components/           # Dashboard UI components
│       └── package.json
├── shadeagent/
│   └── shade-agent-v2/
│       ├── src/
│       │   ├── webhook/          # GitHub webhook handlers
│       │   ├── ai/               # AI review services (Groq, OpenAI, DeepSeek)
│       │   ├── near/             # NEAR transaction logic
│       │   └── tee/              # TEE key management
│       ├── .env.example
│       └── package.json
├── API_DOCUMENTATION.md
├── docker-compose.yml
├── neardebug.json
└── README.md
```

---

## 11. Security Notes

> ⚠️ For production deployment:

- All private key operations occur inside the **Phala TEE** — keys never leave the enclave
- The `MAINTAINER_SECRET` and `GH_WEBHOOK_SECRET` should be long, randomly generated strings
- The NEAR smart contract enforces that only the registered agent address can trigger payouts
- Always use the production Phala deployment rather than the local Shade Agent for mainnet funds
- Rotate your ngrok URL in `SHADE_AGENT_URL` every session during local development

---

<div align="center">

Built for **PL_Genesis: Frontiers of Collaboration** · March 2026

[Live Demo](https://holy-frontend-ctqw.onrender.com) · [GitHub](https://github.com/jerrygeorge360/Holy) · [API Docs](./API_DOCUMENTATION.md)

**Maintained by jerrygeorge360**

</div>