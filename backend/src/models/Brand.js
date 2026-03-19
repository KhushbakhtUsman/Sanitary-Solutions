import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
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
      default: "Supplier in good standing",
    },
  },
  { timestamps: true }
);

brandSchema.index({ name: 1 }, { unique: true });

export const Brand = mongoose.model("Brand", brandSchema);
