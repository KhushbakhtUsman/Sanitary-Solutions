import { User } from "../models/User.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { signJwt } from "../utils/auth.js";

export const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ApiError(400, "Username and password are required");
  }

  const user = await User.findOne({ username: username.trim().toLowerCase() });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = signJwt({ userId: user._id, role: user.role });

  res
    .status(200)
    .json(
      new ApiResponse(200, "Login successful", {
        token,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          role: user.role,
        },
      })
    );
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(
      new ApiResponse(200, "Current user fetched", {
        user: {
          id: req.user._id,
          name: req.user.name,
          username: req.user.username,
          role: req.user.role,
        },
      })
    );
});

export const changeAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValidPassword = await user.comparePassword(currentPassword);
  if (!isValidPassword) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, "Password changed successfully"));
});
