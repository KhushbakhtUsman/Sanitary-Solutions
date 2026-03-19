import mongoose from "mongoose";
import { Customer } from "../models/Customer.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { formatCode } from "../utils/generateCode.js";
import { getPagination } from "../utils/pagination.js";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const formatOrderForClient = (orderDoc) => {
  const order = orderDoc.toObject ? orderDoc.toObject() : orderDoc;
  return {
    id: order.orderNumber,
    _id: order._id,
    orderNumber: order.orderNumber,
    customer: order.customerSnapshot?.name || "",
    email: order.customerSnapshot?.email || "",
    phone: order.customerSnapshot?.phone || "",
    address: order.customerSnapshot?.address || "",
    total: order.total,
    status: order.status,
    items: order.items?.length || 0,
    lineItems: order.items || [],
    date: new Date(order.createdAt).toISOString().split("T")[0],
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

const findOrder = async (value) => {
  if (isObjectId(value)) {
    return Order.findById(value);
  }
  return Order.findOne({ orderNumber: value });
};

const findProductByAnyId = async (value) => {
  if (isObjectId(value)) {
    const product = await Product.findById(value);
    if (product) {
      return product;
    }
  }
  return Product.findOne({ legacyId: String(value) });
};

const buildOrderNumber = async () => {
  const totalOrders = await Order.countDocuments();
  return formatCode("ORD", totalOrders + 1);
};

const getCustomerName = (body) => {
  if (body.name && body.name.trim()) {
    return body.name.trim();
  }
  const firstName = body.firstName?.trim() || "";
  const lastName = body.lastName?.trim() || "";
  return `${firstName} ${lastName}`.trim();
};

export const getOrders = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};
  if (status && status !== "all") {
    filter.status = status;
  }
  if (search?.trim()) {
    const regex = new RegExp(search.trim(), "i");
    filter.$or = [
      { orderNumber: regex },
      { "customerSnapshot.name": regex },
      { "customerSnapshot.email": regex },
      { "customerSnapshot.phone": regex },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      "Orders fetched",
      orders.map(formatOrderForClient),
      {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    )
  );
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await findOrder(req.params.id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  res.status(200).json(new ApiResponse(200, "Order fetched", formatOrderForClient(order)));
});

export const createOrder = asyncHandler(async (req, res) => {
  const { phone, city, postalCode } = req.body;
  const email = req.body.email?.trim().toLowerCase();
  const rawAddress = req.body.address?.trim();
  const items = Array.isArray(req.body.items) ? req.body.items : [];

  const customerName = getCustomerName(req.body);
  if (!customerName || !email || !phone || !rawAddress) {
    throw new ApiError(400, "Name, email, phone, and address are required");
  }

  if (items.length === 0) {
    throw new ApiError(400, "Order requires at least one item");
  }

  const normalizedItems = [];
  const productUpdates = [];

  for (const item of items) {
    const quantity = Number(item.quantity || 0);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ApiError(400, "Each order item requires a valid quantity");
    }

    const candidateId =
      item.productId ||
      item.product?._id ||
      item.product?.legacyId ||
      item.product?.id ||
      item.product ||
      item._id ||
      item.id;

    if (candidateId) {
      const product = await findProductByAnyId(candidateId);
      if (!product) {
        throw new ApiError(404, `Product not found for item ${candidateId}`);
      }

      if (product.quantity < quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }

      normalizedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
      });

      productUpdates.push({ product, quantity });
      continue;
    }

    if (!item.name || typeof item.price !== "number") {
      throw new ApiError(400, "Item must include product reference or name and price");
    }

    normalizedItems.push({
      name: item.name.trim(),
      price: item.price,
      quantity,
    });
  }

  const total = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const orderNumber = await buildOrderNumber();
  const formattedAddress = [rawAddress, city, postalCode].filter(Boolean).join(", ");

  let customer = await Customer.findOne({ email });
  if (!customer) {
    customer = await Customer.create({
      name: customerName,
      email,
      phone,
      address: rawAddress,
      city: city || "",
      postalCode: postalCode || "",
      totalOrders: 0,
      totalSpent: 0,
    });
  } else {
    customer.name = customerName;
    customer.phone = phone;
    customer.address = rawAddress;
    customer.city = city || "";
    customer.postalCode = postalCode || "";
  }

  customer.totalOrders += 1;
  customer.totalSpent += total;
  await customer.save();

  const order = await Order.create({
    orderNumber,
    customer: customer._id,
    customerSnapshot: {
      name: customerName,
      email,
      phone,
      address: formattedAddress,
    },
    items: normalizedItems,
    total,
    status: "processing",
  });

  for (const { product, quantity } of productUpdates) {
    product.quantity -= quantity;
    product.inStock = product.quantity > 0;
    await product.save();
  }

  res.status(201).json(new ApiResponse(201, "Order created", formatOrderForClient(order)));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid order status");
  }

  const order = await findOrder(req.params.id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.status = status;
  await order.save();

  res.status(200).json(new ApiResponse(200, "Order status updated", formatOrderForClient(order)));
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await findOrder(req.params.id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const customer = await Customer.findById(order.customer);
  if (customer) {
    customer.totalOrders = Math.max(0, customer.totalOrders - 1);
    customer.totalSpent = Math.max(0, customer.totalSpent - order.total);
    await customer.save();
  }

  await order.deleteOne();

  res.status(200).json(new ApiResponse(200, "Order deleted"));
});
