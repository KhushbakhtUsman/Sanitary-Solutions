import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { Brand } from "../models/Brand.js";
import { Customer } from "../models/Customer.js";
import { Order } from "../models/Order.js";
import { Quote } from "../models/Quote.js";
import { StoreSetting } from "../models/StoreSetting.js";
import {
  adminSeed,
  brandSeed,
  categorySeed,
  customerSeed,
  orderSeed,
  productSeed,
  quoteSeed,
} from "./seedData.js";

const resetMode = process.argv.includes("--reset");

const buildLineItems = (products, orderTotal, itemCount, orderIndex) => {
  const count = Math.max(itemCount, 1);
  const basePrice = Number((orderTotal / count).toFixed(2));
  const items = [];

  for (let index = 0; index < count; index += 1) {
    const product = products[(orderIndex + index) % products.length];
    const price =
      index === count - 1
        ? Number((orderTotal - basePrice * (count - 1)).toFixed(2))
        : basePrice;

    items.push({
      product: product._id,
      name: product.name,
      price,
      quantity: 1,
    });
  }

  return items;
};

const seed = async () => {
  try {
    await connectDatabase();

    if (resetMode) {
      await Promise.all([
        User.deleteMany({}),
        Product.deleteMany({}),
        Category.deleteMany({}),
        Brand.deleteMany({}),
        Customer.deleteMany({}),
        Order.deleteMany({}),
        Quote.deleteMany({}),
        StoreSetting.deleteMany({}),
      ]);
    }

    const existingAdmin = await User.findOne({ username: adminSeed.username });
    if (!existingAdmin) {
      await User.create(adminSeed);
    }

    for (const category of categorySeed) {
      await Category.findOneAndUpdate(
        { name: category.name },
        category,
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    for (const brand of brandSeed) {
      await Brand.findOneAndUpdate(
        { name: brand.name },
        brand,
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    const productDocs = [];
    for (const product of productSeed) {
      const doc = await Product.findOneAndUpdate(
        { legacyId: product.legacyId },
        { ...product, inStock: product.quantity > 0 ? product.inStock : false },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
      productDocs.push(doc);
    }

    for (const customer of customerSeed) {
      await Customer.findOneAndUpdate(
        { email: customer.email },
        {
          ...customer,
          joinedAt: new Date(customer.joinedAt),
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    for (let index = 0; index < orderSeed.length; index += 1) {
      const order = orderSeed[index];
      const customer = await Customer.findOne({ email: order.customerEmail });
      if (!customer) {
        continue;
      }

      await Order.findOneAndUpdate(
        { orderNumber: order.orderNumber },
        {
          orderNumber: order.orderNumber,
          customer: customer._id,
          customerSnapshot: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
          },
          items: buildLineItems(productDocs, order.total, order.items, index),
          total: order.total,
          status: order.status,
          createdAt: new Date(order.date),
          updatedAt: new Date(order.date),
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    for (const quote of quoteSeed) {
      await Quote.findOneAndUpdate(
        { quoteNumber: quote.quoteNumber },
        {
          quoteNumber: quote.quoteNumber,
          name: quote.name,
          email: quote.email,
          phone: quote.phone,
          projectType: "",
          productsNeeded: quote.productsNeeded,
          productsCount: quote.productsCount,
          total: quote.total ?? Number((quote.productsCount * 165).toFixed(2)),
          status: quote.status,
          createdAt: new Date(quote.date),
          updatedAt: new Date(quote.date),
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    const existingSetting = await StoreSetting.findOne();
    if (!existingSetting) {
      await StoreSetting.create({
        storeName: "Sanitary Solutions",
        supportEmail: "support@sanitarysolutions.com",
        storeAddress: "27 Mall Road, Clifton, Karachi",
        phoneNumber: "+92 300 555 7788",
        lowStockThreshold: 20,
      });
    }

    // eslint-disable-next-line no-console
    console.log("Seeding completed successfully.");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
