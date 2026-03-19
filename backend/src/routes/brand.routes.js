import { Router } from "express";
import {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand,
} from "../controllers/brand.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

router.get("/", getBrands);
router.post("/", authenticate, authorize("admin"), createBrand);
router.patch("/:id", authenticate, authorize("admin"), updateBrand);
router.delete("/:id", authenticate, authorize("admin"), deleteBrand);

export default router;
