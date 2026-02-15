import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { config } from "../config/index.js";

const router = Router();

// GET /auth/github
router.get("/github", (_req: Request, res: Response) => {
  const scopes = "repo admin:repo_hook";
  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.append("client_id", config.github.clientId);
  githubAuthUrl.searchParams.append("redirect_uri", config.github.redirectUri);
  githubAuthUrl.searchParams.append("scope", scopes);
  githubAuthUrl.searchParams.append("allow_signup", "true");

  console.log("Redirecting to GitHub OAuth URL:", githubAuthUrl.toString());

  res.redirect(githubAuthUrl.toString());
});

// GET /auth/github/callback
router.get("/github/callback", async (req: Request, res: Response) => {
  const { code, error } = req.query;

  if (error) {
    console.error("GitHub OAuth error:", error);
    return res.redirect(
      `${config.frontendUrl}/auth/error?message=${encodeURIComponent(String(error))}`
    );
  }

  if (!code) {
    console.error("No code received from GitHub");
    return res.redirect(
      `${config.frontendUrl}/auth/error?message=No authorization code received`
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code: code,
      }),
    });

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      error?: string;
    };

    if (!tokenData.access_token) {
      console.error("Failed to get access token:", tokenData.error);
      return res.redirect(
        `${config.frontendUrl}/auth/error?message=Failed to authenticate with GitHub`
      );
    }

    // Fetch GitHub user profile
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const githubUser = (await userResponse.json()) as {
      id: number;
      login: string;
      email: string | null;
    };

    if (!githubUser.id) {
      console.error("Failed to fetch GitHub user");
      return res.redirect(
        `${config.frontendUrl}/auth/error?message=Failed to fetch user profile`
      );
    }

    // Upsert user in Prisma
    const user = await prisma.user.upsert({
      where: { githubId: githubUser.id },
      update: {
        githubToken: tokenData.access_token,
        username: githubUser.login,
      },
      create: {
        githubId: githubUser.id,
        username: githubUser.login,
        email: githubUser.email,
        githubToken: tokenData.access_token,
      },
      select: { id: true },
    });

    const authToken = jwt.sign({ userId: user.id }, config.sessionSecret, { expiresIn: "7d" });
    return res.redirect(
      `${config.frontendUrl}/auth/callback?token=${encodeURIComponent(authToken)}`
    );
  } catch (err) {
    console.error("GitHub OAuth callback error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return res.redirect(
      `${config.frontendUrl}/auth/error?message=${encodeURIComponent(errorMessage)}`
    );
  }
});

// GET /auth/me
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.authUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.authUserId },
      select: {
        id: true,
        username: true,
        email: true,
        repositories: {
          select: {
            id: true,
            name: true,
            fullName: true,
            url: true,
            nearWallet: true,
            preferences: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

// POST /auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  return res.json({ message: "Logged out successfully" });
});

export default router;