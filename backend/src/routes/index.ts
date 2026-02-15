import { Router } from "express";
import repoRoutes from "./repoRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import exportRoutes from "./exportRoutes.js";
import userRoutes from "./userRoutes.js";
import issueRoutes from "./issueRoutes.js";
import preferenceRoutes from "./preferenceRoutes.js";
import bountyRoutes from "./bountyRoutes.js";
import criteriaRoutes from "./criteriaRoutes.js";

const router = Router();

router.use("/repos", repoRoutes);
router.use("/reviews", reviewRoutes);
router.use("/issues", issueRoutes);
router.use("/preferences", preferenceRoutes);
router.use("/notifications", notificationRoutes);
router.use("/export", exportRoutes);
router.use("/user", userRoutes);
router.use("/bounty", bountyRoutes);
router.use("/criteria", criteriaRoutes);

export default router;
