import { User } from "../models/User.js";
import { Customer } from "../models/Customer.js";
import { asyncHandler } from "./asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyJwt } from "../utils/auth.js";

const getTokenFromHeader = (authorization = "") => {
  if (!authorization.startsWith("Bearer ")) {
    return null;
  }
  return authorization.split(" ")[1];
};

const decodeToken = (token) => {
  try {
    return verifyJwt(token);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }
};

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = getTokenFromHeader(req.headers.authorization);

  if (!token) {
    throw new ApiError(401, "Authentication token is missing");
  }

  const decoded = decodeToken(token);
  if (decoded.role && decoded.role !== "admin") {
    throw new ApiError(401, "Admin authentication required");
  }

  const userId = decoded.userId;
  if (!userId) {
    throw new ApiError(401, "Invalid authentication token");
  }

  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  if (roles.length > 0 && !roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have permission for this action"));
  }

  return next();
};

export const authenticateCustomer = asyncHandler(async (req, res, next) => {
  const token = getTokenFromHeader(req.headers.authorization);

  if (!token) {
    throw new ApiError(401, "Authentication token is missing");
  }

  const decoded = decodeToken(token);
  if (decoded.role !== "customer" || !decoded.customerId) {
    throw new ApiError(401, "Customer authentication required");
  }

  const customer = await Customer.findById(decoded.customerId).select("-password");
  if (!customer || !customer.hasAccount) {
    throw new ApiError(401, "Customer account not found");
  }

  req.customer = customer;
  next();
});
