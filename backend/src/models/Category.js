import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "Seasonal focus",
    },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1 }, { unique: true });

export const Category = mongoose.model("Category", categorySchema);
