import { Router } from "express";
import {
  createQuote,
  deleteQuote,
  getQuoteById,
  getMyQuotes,
  getQuotes,
  updateQuoteStatus,
} from "../controllers/quote.controller.js";
import { authenticate, authenticateCustomer, authorize } from "../middlewares/auth.js";

const router = Router();

router.post("/", createQuote);
router.get("/my", authenticateCustomer, getMyQuotes);
router.get("/", authenticate, authorize("admin"), getQuotes);
router.get("/:id", authenticate, authorize("admin"), getQuoteById);
router.patch("/:id/status", authenticate, authorize("admin"), updateQuoteStatus);
router.delete("/:id", authenticate, authorize("admin"), deleteQuote);

export default router;
