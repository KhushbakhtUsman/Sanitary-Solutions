import { Router } from "express";
import {
  changeAdminPassword,
  getCurrentUser,
  loginAdmin,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/login", loginAdmin);
router.get("/me", authenticate, getCurrentUser);
router.post("/change-password", authenticate, changeAdminPassword);

export default router;
