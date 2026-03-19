import mongoose from "mongoose";
import { Quote } from "../models/Quote.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { formatCode } from "../utils/generateCode.js";
import { getPagination } from "../utils/pagination.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getQuoteByAnyId = async (value) => {
  if (isObjectId(value)) {
    const quote = await Quote.findById(value);
    if (quote) {
      return quote;
    }
  }
  return Quote.findOne({ quoteNumber: value });
};

const formatQuoteForClient = (quoteDoc) => {
  const quote = quoteDoc.toObject ? quoteDoc.toObject() : quoteDoc;
  const estimatedTotal = Number((quote.productsCount * 165).toFixed(2));
  return {
    id: quote.quoteNumber,
    _id: quote._id,
    quoteNumber: quote.quoteNumber,
    name: quote.name,
    email: quote.email,
    phone: quote.phone,
    projectType: quote.projectType,
    productsNeeded: quote.productsNeeded,
    products: quote.productsCount,
    total: quote.total || estimatedTotal,
    status: quote.status,
    date: new Date(quote.createdAt).toISOString().split("T")[0],
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
  };
};

const estimateProductsCount = (rawProductsNeeded = "") => {
  if (!rawProductsNeeded) {
    return 0;
  }
  const byLines = rawProductsNeeded
    .split(/\n|,/)
    .map((part) => part.trim())
    .filter(Boolean).length;
  return byLines;
};

const buildQuoteNumber = async () => {
  const totalQuotes = await Quote.countDocuments();
  return formatCode("QT", totalQuotes + 1);
};

export const getQuotes = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};
  if (status && status !== "all") {
    filter.status = status;
  }
  if (search?.trim()) {
    const regex = new RegExp(search.trim(), "i");
    filter.$or = [{ quoteNumber: regex }, { name: regex }, { email: regex }, { phone: regex }];
  }

  const [quotes, total] = await Promise.all([
    Quote.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Quote.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      "Quotes fetched",
      quotes.map(formatQuoteForClient),
      {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    )
  );
});

export const getQuoteById = asyncHandler(async (req, res) => {
  const quote = await getQuoteByAnyId(req.params.id);
  if (!quote) {
    throw new ApiError(404, "Quote not found");
  }

  res.status(200).json(new ApiResponse(200, "Quote fetched", formatQuoteForClient(quote)));
});

export const createQuote = asyncHandler(async (req, res) => {
  const { name, email, phone, projectType, productsNeeded } = req.body;

  if (!name || !email || !phone || !productsNeeded) {
    throw new ApiError(400, "Name, email, phone, and products needed are required");
  }

  const parsedTotal = Number(req.body.total);
  const productsCount =
    Number.isInteger(req.body.productsCount) && req.body.productsCount >= 0
      ? req.body.productsCount
      : estimateProductsCount(productsNeeded);

  const quote = await Quote.create({
    quoteNumber: await buildQuoteNumber(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    projectType: projectType?.trim() || "",
    productsNeeded: productsNeeded.trim(),
    productsCount,
    total:
      Number.isFinite(parsedTotal) && parsedTotal >= 0
        ? parsedTotal
        : Number((productsCount * 165).toFixed(2)),
    status: "pending",
  });

  res.status(201).json(new ApiResponse(201, "Quote request created", formatQuoteForClient(quote)));
});

export const updateQuoteStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["pending", "responded", "converted", "rejected"];
  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid quote status");
  }

  const quote = await getQuoteByAnyId(req.params.id);
  if (!quote) {
    throw new ApiError(404, "Quote not found");
  }

  quote.status = status;
  await quote.save();

  res.status(200).json(new ApiResponse(200, "Quote status updated", formatQuoteForClient(quote)));
});

export const deleteQuote = asyncHandler(async (req, res) => {
  const quote = await getQuoteByAnyId(req.params.id);
  if (!quote) {
    throw new ApiError(404, "Quote not found");
  }

  await quote.deleteOne();

  res.status(200).json(new ApiResponse(200, "Quote deleted"));
});
