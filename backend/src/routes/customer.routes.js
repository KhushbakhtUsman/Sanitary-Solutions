import { Router } from "express";
import { deleteCustomer, getCustomerById, getCustomers } from "../controllers/customer.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticate, authorize("admin"), getCustomers);
router.get("/:id", authenticate, authorize("admin"), getCustomerById);
router.delete("/:id", authenticate, authorize("admin"), deleteCustomer);

export default router;
