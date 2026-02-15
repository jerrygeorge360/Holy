import { Router } from "express";
import reposRouter from "./repos.js";
import bountyRoutes from "./bountyRoutes.js";
import criteriaRoutes from "./criteriaRoutes.js";

const router = Router();

router.use("/repos", reposRouter);
router.use("/bounty", bountyRoutes);
router.use("/criteria", criteriaRoutes);

export default router;
