import express from "express";
import dotenv from "dotenv";
import { ShadeClient } from "@neardefi/shade-agent-js";
import webhookRouter from "./routes/webhook";
import { criteriaRouter } from "./store/criteria";
import bountyRouter from "./routes/bounty";
import { getPayoutStats } from "./store/payoutLog";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

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
    numKeys: 10,
    derivationPath: "default",
  });
  // Fund the agent account so it can exist on-chain and manage keys
console.log("Funding agent account...");
await agent.fund(0.1); // 0.2 NEAR
console.log("Agent funded successfully");
console.log("Shade agent initialized:", agent.accountId());
console.log("Registering agent...");
await agent.register();
console.log("Agent registered successfully");

  const app = express();

  // Request logger for debugging
  if (process.env.DEBUG === "true") {
    app.use((req, _res, next) => {
      console.log(`Incoming request: ${req.method} ${req.url}`);
      next();
    });
  }

  app.use(
    "/api/webhook",
    express.raw({ type: "application/json" }),
    webhookRouter,
  );
  app.use(express.json());

  /**
   * @swagger
   * /api/health:
   *   get:
   *     summary: Check agent health and status
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Agent status and payout stats
   */
  app.get("/api/health", (_req, res) => {
    const payouts = getPayoutStats();
    res.json({
      status: "ok",
      agent: "registered",
      agentAccountId: getAgent().accountId(),
      payouts,
    });
  });

  // Swagger documentation
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(criteriaRouter);
  app.use(bountyRouter);

  // Catch-all 404 handler
  app.use((req, res) => {
    console.warn(`404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: "Not Found", path: req.url });
  });

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
