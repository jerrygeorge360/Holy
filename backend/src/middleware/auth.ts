import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

const getTokenFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }

  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const tokenCookie = cookies.find((cookie) => cookie.startsWith("auth_token="));
  if (!tokenCookie) return null;

  return decodeURIComponent(tokenCookie.split("=")[1] || "");
};

// Protect routes that require login
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, config.sessionSecret) as { userId?: string; sub?: string };
    const userId = payload.userId || payload.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.authUserId = userId;
    return next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

/**
 * Strict Agent-Only Authentication
 * Bypasses JWT check but requires valid x-agent-secret
 */
export const requireAgentAuth = (req: Request, res: Response, next: NextFunction) => {
  const agentSecret = req.header("x-agent-secret");

  if (!config.maintainerSecret) {
    console.error("MAINTAINER_SECRET not configured on server");
    return res.status(500).json({ error: "Agent authentication not configured" });
  }

  if (agentSecret && agentSecret === config.maintainerSecret) {
    return next();
  }

  return res.status(403).json({ error: "Forbidden: Invalid agent secret" });
};