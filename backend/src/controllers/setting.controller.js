import { StoreSetting } from "../models/StoreSetting.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getOrCreateSetting = async () => {
  let setting = await StoreSetting.findOne();
  if (!setting) {
    setting = await StoreSetting.create({
      storeName: "Sanitary Solutions",
      supportEmail: "support@sanitarysolutions.com",
      storeAddress: "27 Mall Road, Clifton, Karachi",
      phoneNumber: "+92 300 555 7788",
      lowStockThreshold: 20,
    });
  }

  let needsSave = false;
  if (!setting.storeAddress) {
    setting.storeAddress = "27 Mall Road, Clifton, Karachi";
    needsSave = true;
  }
  if (!setting.phoneNumber) {
    setting.phoneNumber = "+92 300 555 7788";
    needsSave = true;
  }
  if (needsSave) {
    await setting.save();
  }

  return setting;
};

export const getStoreSetting = asyncHandler(async (req, res) => {
  const setting = await getOrCreateSetting();
  res.status(200).json(new ApiResponse(200, "Store settings fetched", setting));
});

export const getPublicStoreSetting = asyncHandler(async (req, res) => {
  const setting = await getOrCreateSetting();
  res.status(200).json(
    new ApiResponse(200, "Public store settings fetched", {
      storeName: setting.storeName,
      supportEmail: setting.supportEmail,
      storeAddress: setting.storeAddress,
      phoneNumber: setting.phoneNumber,
    })
  );
});

export const updateStoreSetting = asyncHandler(async (req, res) => {
  const setting = await getOrCreateSetting();
  const parsedThreshold = Number(req.body.lowStockThreshold);
  setting.storeName = req.body.storeName ?? setting.storeName;
  setting.supportEmail = req.body.supportEmail ?? setting.supportEmail;
  setting.storeAddress = req.body.storeAddress ?? setting.storeAddress;
  setting.phoneNumber = req.body.phoneNumber ?? setting.phoneNumber;
  setting.lowStockThreshold =
    Number.isFinite(parsedThreshold)
      ? parsedThreshold
      : setting.lowStockThreshold;

  await setting.save();

  res.status(200).json(new ApiResponse(200, "Store settings updated", setting));
});
