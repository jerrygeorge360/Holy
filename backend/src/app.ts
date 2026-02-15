import express from "express";
import type { Request, Response } from "express";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { errorHandler } from "./middlewares/errorHandler.js";
import routes from "./routes/index.js";
import authRouter from "./routes/authRoutes.js";
import { requireAuth } from "./middleware/auth.js";
import { config } from "./config/index.js";

const app = express();

// Security headers
app.use(helmet());

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

app.use(express.json());


app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Auth routes
app.use("/auth", authRouter);

// API routes (all authenticated)
app.use("/api", requireAuth, routes);

app.use(errorHandler);

export default app;
