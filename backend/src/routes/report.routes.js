import { Router } from "express";
import { getReportsOverview } from "../controllers/report.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.get("/overview", authenticate, authorize("admin"), getReportsOverview);

export default router;
