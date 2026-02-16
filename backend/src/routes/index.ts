import { Router } from "express";
import reposRouter from "./repos.js";
import bountyRoutes from "./bountyRoutes.js";
import criteriaRoutes from "./criteriaRoutes.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use("/repos", requireAuth, reposRouter);
router.use("/bounty", bountyRoutes);
router.use("/criteria", requireAuth, criteriaRoutes);

export default router;
