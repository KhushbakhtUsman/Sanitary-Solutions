import { Router } from "express";
import { clearCart, getCart, saveCart } from "../controllers/cart.controller.js";

const router = Router();

router.get("/", getCart);
router.put("/", saveCart);
router.delete("/", clearCart);

export default router;
