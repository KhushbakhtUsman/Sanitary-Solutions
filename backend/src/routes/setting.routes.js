import { Router } from "express";
import {
  getPublicStoreSetting,
  getStoreSetting,
  updateStoreSetting,
} from "../controllers/setting.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.get("/public", getPublicStoreSetting);
router.get("/store", authenticate, authorize("admin"), getStoreSetting);
router.patch("/store", authenticate, authorize("admin"), updateStoreSetting);

export default router;
