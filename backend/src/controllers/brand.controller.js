import { Brand } from "../models/Brand.js";
import { Product } from "../models/Product.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const buildBrandFilter = (query) => {
  const filter = {};
  if (query.search?.trim()) {
    const regex = new RegExp(query.search.trim(), "i");
    filter.$or = [{ name: regex }, { description: regex }];
  }
  return filter;
};

export const getBrands = asyncHandler(async (req, res) => {
  const filter = buildBrandFilter(req.query);
  const brands = await Brand.find(filter).sort({ name: 1 });

  res.status(200).json(new ApiResponse(200, "Brands fetched", brands));
});

export const createBrand = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  if (!name) {
    throw new ApiError(400, "Brand name is required");
  }

  const duplicate = await Brand.findOne({ name });
  if (duplicate) {
    throw new ApiError(409, "Brand already exists");
  }

  const brand = await Brand.create({
    name,
    description: req.body.description?.trim() || "Supplier in good standing",
  });

  res.status(201).json(new ApiResponse(201, "Brand created", brand));
});

export const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    throw new ApiError(404, "Brand not found");
  }

  const nextName = req.body.name?.trim() || brand.name;
  const nextDescription = req.body.description?.trim() || brand.description;

  const duplicate = await Brand.findOne({
    name: nextName,
    _id: { $ne: brand._id },
  });
  if (duplicate) {
    throw new ApiError(409, "Brand already exists");
  }

  const previousName = brand.name;
  brand.name = nextName;
  brand.description = nextDescription;
  await brand.save();

  if (previousName !== nextName) {
    await Product.updateMany({ brand: previousName }, { $set: { brand: nextName } });
  }

  res.status(200).json(new ApiResponse(200, "Brand updated", brand));
});

export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    throw new ApiError(404, "Brand not found");
  }

  const productsCount = await Product.countDocuments({ brand: brand.name });
  if (productsCount > 0) {
    throw new ApiError(400, "Cannot delete brand while products are assigned to it");
  }

  await brand.deleteOne();

  res.status(200).json(new ApiResponse(200, "Brand deleted"));
});
