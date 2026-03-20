import { Customer } from "../models/Customer.js";
import { Order } from "../models/Order.js";
import { Quote } from "../models/Quote.js";
import { Cart } from "../models/Cart.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getPagination } from "../utils/pagination.js";

const formatCustomerForClient = (customerDoc) => {
  const customer = customerDoc.toObject ? customerDoc.toObject() : customerDoc;
  return {
    id: customer._id,
    _id: customer._id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    city: customer.city,
    postalCode: customer.postalCode,
    orders: customer.totalOrders,
    totalSpent: customer.totalSpent,
    joined: new Date(customer.joinedAt).toISOString().split("T")[0],
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
};

export const getCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const includeGuests = req.query.includeGuests === "true";

  const filter = includeGuests ? {} : { hasAccount: true };
  if (req.query.search) {
    const regex = new RegExp(req.query.search.trim(), "i");
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const [customers, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Customer.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      "Customers fetched",
      customers.map(formatCustomerForClient),
      {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    )
  );
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  res.status(200).json(new ApiResponse(200, "Customer fetched", formatCustomerForClient(customer)));
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  const [deletedOrders, deletedQuotes, deletedCarts] = await Promise.all([
    Order.deleteMany({ customer: customer._id }),
    Quote.deleteMany({ email: customer.email }),
    Cart.deleteMany({ customerEmail: customer.email }),
  ]);

  await customer.deleteOne();

  res.status(200).json(
    new ApiResponse(200, "Customer deleted", {
      customerId: req.params.id,
      deletedOrders: deletedOrders.deletedCount || 0,
      deletedQuotes: deletedQuotes.deletedCount || 0,
      deletedCarts: deletedCarts.deletedCount || 0,
    })
  );
});
