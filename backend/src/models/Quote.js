import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    quoteNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    projectType: {
      type: String,
      trim: true,
      default: "",
    },
    productsNeeded: {
      type: String,
      required: true,
      trim: true,
    },
    productsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "responded", "converted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

quoteSchema.index({ status: 1, createdAt: -1 });

export const Quote = mongoose.model("Quote", quoteSchema);
