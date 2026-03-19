import { Router } from "express";
import { getCustomerById, getCustomers } from "../controllers/customer.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticate, authorize("admin"), getCustomers);
router.get("/:id", authenticate, authorize("admin"), getCustomerById);

export default router;
