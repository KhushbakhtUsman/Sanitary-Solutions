import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const buildCategoryFilter = (query) => {
  const filter = {};
  if (query.search?.trim()) {
    const regex = new RegExp(query.search.trim(), "i");
    filter.$or = [{ name: regex }, { description: regex }];
  }
  return filter;
};

export const getCategories = asyncHandler(async (req, res) => {
  const filter = buildCategoryFilter(req.query);
  const categories = await Category.find(filter).sort({ name: 1 });

  res.status(200).json(new ApiResponse(200, "Categories fetched", categories));
});

export const createCategory = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  if (!name) {
    throw new ApiError(400, "Category name is required");
  }

  const duplicate = await Category.findOne({ name });
  if (duplicate) {
    throw new ApiError(409, "Category already exists");
  }

  const category = await Category.create({
    name,
    description: req.body.description?.trim() || "Seasonal focus",
  });

  res.status(201).json(new ApiResponse(201, "Category created", category));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const nextName = req.body.name?.trim() || category.name;
  const nextDescription = req.body.description?.trim() || category.description;

  const duplicate = await Category.findOne({
    name: nextName,
    _id: { $ne: category._id },
  });
  if (duplicate) {
    throw new ApiError(409, "Category already exists");
  }

  const previousName = category.name;
  category.name = nextName;
  category.description = nextDescription;
  await category.save();

  if (previousName !== nextName) {
    await Product.updateMany({ category: previousName }, { $set: { category: nextName } });
  }

  res.status(200).json(new ApiResponse(200, "Category updated", category));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const productsCount = await Product.countDocuments({ category: category.name });
  if (productsCount > 0) {
    throw new ApiError(400, "Cannot delete category while products are assigned to it");
  }

  await category.deleteOne();

  res.status(200).json(new ApiResponse(200, "Category deleted"));
});
