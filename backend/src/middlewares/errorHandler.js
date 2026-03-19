import mongoose from "mongoose";

export const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";
  let details = error.details || null;

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(error.errors).map((err) => err.message);
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "Duplicate value error";
    details = error.keyValue;
  }

  if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${error.path}`;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    details,
  });
};
