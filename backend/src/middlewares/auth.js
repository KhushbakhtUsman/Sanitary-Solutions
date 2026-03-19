import { User } from "../models/User.js";
import { asyncHandler } from "./asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyJwt } from "../utils/auth.js";

const getTokenFromHeader = (authorization = "") => {
  if (!authorization.startsWith("Bearer ")) {
    return null;
  }
  return authorization.split(" ")[1];
};

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = getTokenFromHeader(req.headers.authorization);

  if (!token) {
    throw new ApiError(401, "Authentication token is missing");
  }

  let decoded;
  try {
    decoded = verifyJwt(token);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decoded.userId).select("-password");
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
