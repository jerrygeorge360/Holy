import "dotenv/config";

export const config = {
  // Server
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database
  databaseUrl: process.env.DATABASE_URL || "",

  // GitHub OAuth
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "Iv23litMcyF0U0TuPPIX",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "0adffdc30bb80ffd529140c481850017edad4e6a",
    redirectUri: process.env.GITHUB_REDIRECT_URI || "http://localhost:4701/auth/github/callback",
    webhookSecret: process.env.GH_WEBHOOK_SECRET || "ultimateman",
  },

  // JWT / Session
  sessionSecret: process.env.SESSION_SECRET || "dev-secret-key",

  // URLs
  baseUrl: process.env.BASE_URL || "http://localhost:4701",
  backendUrl: process.env.BACKEND_URL || "http://localhost:4701",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:4700",
  shadeAgentUrl: process.env.SHADE_AGENT_URL || "http://localhost:4783",
  maintainerSecret: process.env.MAINTAINER_SECRET,
};
