import express from "express";
import dotenv from "dotenv";
import { ShadeClient } from "@neardefi/shade-agent-js";
import webhookRouter from "./routes/webhook";
import { criteriaRouter } from "./store/criteria";
import bountyRouter from "./routes/bounty";
import { getPayoutStats } from "./store/payoutLog";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const agentContractId = process.env.AGENT_CONTRACT_ID;
const sponsorAccountId = process.env.SPONSOR_ACCOUNT_ID;
const sponsorPrivateKey = process.env.SPONSOR_PRIVATE_KEY;

if (!agentContractId || !sponsorAccountId || !sponsorPrivateKey) {
  throw new Error(
    "Missing required environment variables AGENT_CONTRACT_ID, SPONSOR_ACCOUNT_ID, SPONSOR_PRIVATE_KEY",
  );
}

export let agent: ShadeClient | null = null;

export function getAgent(): ShadeClient {
  if (!agent) {
    throw new Error("Shade agent not initialized");
  }
  return agent;
}

async function start() {
  const networkId = process.env.NETWORK_ID as "testnet" | "mainnet" | undefined || "testnet";
  agent = await ShadeClient.create({
    networkId,
    agentContractId: agentContractId!,
    sponsor: {
      accountId: sponsorAccountId!,
      privateKey: sponsorPrivateKey!,
    },
    derivationPath: "default",
  });

  const app = express();

  app.use(
    "/api/webhook",
    express.raw({ type: "application/json" }),
    webhookRouter,
  );
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    const payouts = getPayoutStats();
    res.json({
      status: "ok",
      agent: "registered",
      agentAccountId: agent.accountId(),
      payouts,
    });
  });

  app.use(criteriaRouter);
  app.use(bountyRouter);

  console.log("Shade agent initialized:", agent.accountId());
  console.log("Agent registration handled by shade-agent-js");

  const port = Number(process.env.PORT || "3000");
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start agent server:", error);
  process.exit(1);
});
