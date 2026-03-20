import { Customer } from "../models/Customer.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { signJwt } from "../utils/auth.js";

const normalizeEmail = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }
  return value.trim().toLowerCase();
};

const formatCustomerForClient = (customerDoc) => {
  const customer = customerDoc.toObject ? customerDoc.toObject() : customerDoc;

  return {
    id: customer._id,
    _id: customer._id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone || "",
    address: customer.address || "",
    city: customer.city || "",
    postalCode: customer.postalCode || "",
    hasAccount: Boolean(customer.hasAccount),
    role: "customer",
  };
};

export const signupCustomer = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  const email = normalizeEmail(req.body.email);
  const phone = req.body.phone?.trim();
  const password = req.body.password;

  if (!name || !email || !phone || !password) {
    throw new ApiError(400, "Name, email, phone, and password are required");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const address = req.body.address?.trim() || "";
  const city = req.body.city?.trim() || "";
  const postalCode = req.body.postalCode?.trim() || "";

  let customer = await Customer.findOne({ email });

  if (customer && customer.hasAccount) {
    throw new ApiError(409, "An account already exists for this email");
  }

  if (customer) {
    customer.name = name;
    customer.phone = phone;
    customer.address = address;
    customer.city = city;
    customer.postalCode = postalCode;
    customer.password = password;
    await customer.save();
  } else {
    customer = await Customer.create({
      name,
      email,
      phone,
      address,
      city,
      postalCode,
      password,
      hasAccount: true,
      totalOrders: 0,
      totalSpent: 0,
    });
  }

  const token = signJwt({ customerId: customer._id, role: "customer" });

  res.status(201).json(
    new ApiResponse(201, "Customer account created", {
      token,
      user: formatCustomerForClient(customer),
    })
  );
});

export const loginCustomer = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const customer = await Customer.findOne({ email }).select("+password");
  if (!customer || !customer.hasAccount) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isValidPassword = await customer.comparePassword(password);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = signJwt({ customerId: customer._id, role: "customer" });

  res.status(200).json(
    new ApiResponse(200, "Customer login successful", {
      token,
      user: formatCustomerForClient(customer),
    })
  );
});

export const getCurrentCustomer = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, "Current customer fetched", {
      user: formatCustomerForClient(req.customer),
    })
  );
});

export const updateCurrentCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.customer._id);
  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  const name = req.body.name?.trim();
  const phone = req.body.phone?.trim();

  if (!name || !phone) {
    throw new ApiError(400, "Name and phone are required");
  }

  customer.name = name;
  customer.phone = phone;
  customer.address = req.body.address?.trim() || "";
  customer.city = req.body.city?.trim() || "";
  customer.postalCode = req.body.postalCode?.trim() || "";

  await customer.save();

  res.status(200).json(
    new ApiResponse(200, "Customer profile updated", {
      user: formatCustomerForClient(customer),
    })
  );
});

export const changeCustomerPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters");
  }

  const customer = await Customer.findById(req.customer._id).select("+password");
  if (!customer || !customer.hasAccount) {
    throw new ApiError(404, "Customer account not found");
  }

  const isValidPassword = await customer.comparePassword(currentPassword);
  if (!isValidPassword) {
    throw new ApiError(400, "Current password is incorrect");
  }

  customer.password = newPassword;
  await customer.save();

  res.status(200).json(new ApiResponse(200, "Password changed successfully"));
});
