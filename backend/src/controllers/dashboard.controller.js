import { Customer } from "../models/Customer.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Quote } from "../models/Quote.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getStartOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);

const monthLabel = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
  }).format(date);

const formatRecentOrder = (orderDoc) => ({
  id: orderDoc.orderNumber,
  customer: orderDoc.customerSnapshot?.name || "",
  status: orderDoc.status,
  total: orderDoc.total,
  date: new Date(orderDoc.createdAt).toISOString().split("T")[0],
});

const formatRecentQuote = (quoteDoc) => ({
  id: quoteDoc.quoteNumber,
  name: quoteDoc.name,
  products: quoteDoc.productsCount,
  status: quoteDoc.status,
  date: new Date(quoteDoc.createdAt).toISOString().split("T")[0],
});

const buildRevenueTrend = async (months = 6) => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const trendRows = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  const trendMap = new Map(
    trendRows.map((row) => [`${row._id.year}-${row._id.month}`, { revenue: row.revenue, orders: row.orders }])
  );

  const points = [];
  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    const values = trendMap.get(key) || { revenue: 0, orders: 0 };
    points.push({
      month: monthLabel(date),
      revenue: values.revenue,
      orders: values.orders,
    });
  }

  return points;
};

const buildCustomerSatisfaction = async () => {
  const rows = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = rows.reduce((acc, row) => {
    acc[row._id] = row.count;
    return acc;
  }, {});

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  if (total === 0) {
    return [
      { name: "Promoters", value: 68 },
      { name: "Passive", value: 20 },
      { name: "Detractors", value: 12 },
    ];
  }

  const delivered = counts.delivered || 0;
  const passiveRaw = (counts.processing || 0) + (counts.shipped || 0);
  const detractorRaw = (counts.pending || 0) + (counts.cancelled || 0);

  const promoters = Math.round((delivered / total) * 100);
  const passive = Math.round((passiveRaw / total) * 100);
  const detractors = Math.max(0, 100 - promoters - passive);

  const normalizedDetractors =
    promoters + passive + detractors === 100
      ? detractors
      : Math.max(0, detractorRaw ? Math.round((detractorRaw / total) * 100) : 0);

  return [
    { name: "Promoters", value: promoters },
    { name: "Passive", value: passive },
    { name: "Detractors", value: normalizedDetractors },
  ];
};

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const [productsCount, customersCount, ordersCount, pendingQuotes, recentOrders, recentQuotes] =
    await Promise.all([
      Product.countDocuments(),
      Customer.countDocuments(),
      Order.countDocuments(),
      Quote.countDocuments({ status: "pending" }),
      Order.find().sort({ createdAt: -1 }).limit(5),
      Quote.find().sort({ createdAt: -1 }).limit(3),
    ]);

  const monthStart = getStartOfMonth();
  const monthlyRevenueRows = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: monthStart },
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$total" },
      },
    },
  ]);
  const revenue = monthlyRevenueRows[0]?.totalRevenue || 0;

  res.status(200).json(
    new ApiResponse(200, "Dashboard summary fetched", {
      stats: {
        revenue,
        orders: ordersCount,
        products: productsCount,
        customers: customersCount,
      },
      pendingQuotes,
      recentOrders: recentOrders.map(formatRecentOrder),
      recentQuotes: recentQuotes.map(formatRecentQuote),
    })
  );
});

export const getRevenueTrend = asyncHandler(async (req, res) => {
  const months = Math.min(Math.max(Number.parseInt(req.query.months || "6", 10), 1), 12);
  const revenueByMonth = await buildRevenueTrend(months);
  res.status(200).json(new ApiResponse(200, "Revenue trend fetched", revenueByMonth));
});

export const getCustomerSatisfaction = asyncHandler(async (req, res) => {
  const customerSatisfaction = await buildCustomerSatisfaction();
  res
    .status(200)
    .json(new ApiResponse(200, "Customer satisfaction data fetched", customerSatisfaction));
});

export const getDashboardBundle = asyncHandler(async (req, res) => {
  const [summaryResponse, revenueByMonth, customerSatisfaction] = await Promise.all([
    (async () => {
      const [productsCount, customersCount, ordersCount, pendingQuotes, recentOrders, recentQuotes] =
        await Promise.all([
          Product.countDocuments(),
          Customer.countDocuments(),
          Order.countDocuments(),
          Quote.countDocuments({ status: "pending" }),
          Order.find().sort({ createdAt: -1 }).limit(5),
          Quote.find().sort({ createdAt: -1 }).limit(3),
        ]);

      const monthStart = getStartOfMonth();
      const monthlyRevenueRows = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: monthStart },
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
          },
        },
      ]);

      return {
        stats: {
          revenue: monthlyRevenueRows[0]?.totalRevenue || 0,
          orders: ordersCount,
          products: productsCount,
          customers: customersCount,
        },
        pendingQuotes,
        recentOrders: recentOrders.map(formatRecentOrder),
        recentQuotes: recentQuotes.map(formatRecentQuote),
      };
    })(),
    buildRevenueTrend(6),
    buildCustomerSatisfaction(),
  ]);

  res.status(200).json(
    new ApiResponse(200, "Dashboard bundle fetched", {
      ...summaryResponse,
      revenueByMonth,
      customerSatisfaction,
    })
  );
});
