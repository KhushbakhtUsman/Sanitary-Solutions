import { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.post("/", createOrder);
router.get("/", authenticate, authorize("admin"), getOrders);
router.get("/:id", authenticate, authorize("admin"), getOrderById);
router.patch("/:id/status", authenticate, authorize("admin"), updateOrderStatus);
router.delete("/:id", authenticate, authorize("admin"), deleteOrder);

export default router;
