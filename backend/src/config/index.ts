import "dotenv/config";

export const config = {
  // Server
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database
  databaseUrl: process.env.DATABASE_URL || "",

  // GitHub OAuth
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    redirectUri: process.env.GITHUB_REDIRECT_URI || "http://localhost:3001/auth/github/callback",
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || "",
  },

  // JWT / Session
  sessionSecret: process.env.SESSION_SECRET || "dev-secret-key",

  // URLs
  baseUrl: process.env.BASE_URL || "http://localhost:3001",
  backendUrl: process.env.BACKEND_URL || "http://localhost:3001",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  shadeAgentUrl: process.env.SHADE_AGENT_URL || "http://localhost:3000",
  maintainerSecret: process.env.MAINTAINER_SECRET || "lockmeup",
};
