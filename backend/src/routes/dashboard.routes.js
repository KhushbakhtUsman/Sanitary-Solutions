import { Router } from "express";
import {
  getCustomerSatisfaction,
  getDashboardBundle,
  getDashboardSummary,
  getRevenueTrend,
} from "../controllers/dashboard.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/summary", getDashboardSummary);
router.get("/revenue-trend", getRevenueTrend);
router.get("/customer-satisfaction", getCustomerSatisfaction);
router.get("/bundle", getDashboardBundle);

export default router;
