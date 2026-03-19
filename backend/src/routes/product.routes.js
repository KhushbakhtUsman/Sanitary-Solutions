import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProductMeta,
  getProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.get("/", getProducts);
router.get("/meta", getProductMeta);
router.get("/:id", getProductById);
router.post("/", authenticate, authorize("admin"), createProduct);
router.patch("/:id", authenticate, authorize("admin"), updateProduct);
router.delete("/:id", authenticate, authorize("admin"), deleteProduct);

export default router;
