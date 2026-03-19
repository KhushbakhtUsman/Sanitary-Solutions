import mongoose from "mongoose";

const storeSettingSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
      trim: true,
      default: "Sanitary Solutions",
    },
    supportEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: "support@sanitarysolutions.com",
    },
    storeAddress: {
      type: String,
      required: true,
      trim: true,
      default: "27 Mall Road, Clifton, Karachi",
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      default: "+92 300 555 7788",
    },
    lowStockThreshold: {
      type: Number,
      required: true,
      min: 0,
      default: 20,
    },
  },
  { timestamps: true }
);

export const StoreSetting = mongoose.model("StoreSetting", storeSettingSchema);
