import { Customer } from "../models/Customer.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Quote } from "../models/Quote.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const VALID_RANGES = ["day", "week", "month", "year", "custom"];

const startOfUtcDay = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));

const endOfUtcDay = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

const startOfUtcWeek = (date) => {
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const shifted = new Date(date);
  shifted.setUTCDate(shifted.getUTCDate() + diff);
  return startOfUtcDay(shifted);
};

const startOfUtcMonth = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));

const startOfUtcYear = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0));

const pad2 = (value) => String(value).padStart(2, "0");

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const parseCustomDate = (value, type) => {
  if (!value || typeof value !== "string") {
    throw new ApiError(400, `${type} date is required for custom range`);
  }

  const parsed =
    type === "End"
      ? new Date(`${value}T23:59:59.999Z`)
      : new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, `${type} date is invalid`);
  }

  return parsed;
};

const resolveDashboardWindow = (query) => {
  const now = new Date();
  const range = VALID_RANGES.includes(query.range) ? query.range : "month";

  let start = null;
  let end = null;

  if (range === "day") {
    start = startOfUtcDay(now);
    end = now;
  } else if (range === "week") {
    start = startOfUtcWeek(now);
    end = now;
  } else if (range === "month") {
    start = startOfUtcMonth(now);
    end = now;
  } else if (range === "year") {
    start = startOfUtcYear(now);
    end = now;
  } else {
    start = parseCustomDate(query.startDate, "Start");
    end = parseCustomDate(query.endDate, "End");
  }

  if (start > end) {
    throw new ApiError(400, "Start date must be before end date");
  }

  return { range, start, end };
};

const getTrendGranularity = (range, start, end) => {
  if (range === "day") return "hour";
  if (range === "year") return "month";
  if (range === "custom") {
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return totalDays > 120 ? "month" : "day";
  }
  return "day";
};

const formatTrendKey = (date, granularity) => {
  const year = date.getUTCFullYear();
  const month = pad2(date.getUTCMonth() + 1);
  const day = pad2(date.getUTCDate());
  const hour = pad2(date.getUTCHours());

  if (granularity === "hour") {
    return `${year}-${month}-${day}T${hour}`;
  }
  if (granularity === "month") {
    return `${year}-${month}`;
  }
  return `${year}-${month}-${day}`;
};

const formatTrendLabel = (date, granularity) => {
  if (granularity === "hour") {
    return `${pad2(date.getUTCHours())}:00`;
  }

  if (granularity === "month") {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      timeZone: "UTC",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const buildTrendBuckets = (start, end, granularity) => {
  const cursor =
    granularity === "month"
      ? new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1, 0, 0, 0, 0))
      : new Date(start);

  const buckets = [];

  while (cursor <= end) {
    buckets.push({
      key: formatTrendKey(cursor, granularity),
      label: formatTrendLabel(cursor, granularity),
    });

    if (granularity === "hour") {
      cursor.setUTCHours(cursor.getUTCHours() + 1);
    } else if (granularity === "month") {
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    } else {
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  return buckets;
};

const aggregateRevenueTotal = async (model, match, valueField) => {
  const rows = await model.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: `$${valueField}` },
      },
    },
  ]);

  return rows[0]?.total || 0;
};

const aggregateRevenueByBucket = async (model, match, valueField, granularity) => {
  const formatMap = {
    hour: "%Y-%m-%dT%H",
    day: "%Y-%m-%d",
    month: "%Y-%m",
  };

  const rows = await model.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: {
            format: formatMap[granularity],
            date: "$createdAt",
            timezone: "UTC",
          },
        },
        total: { $sum: `$${valueField}` },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return new Map(rows.map((row) => [row._id, row.total]));
};

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
  total: quoteDoc.total || 0,
  status: quoteDoc.status,
  date: new Date(quoteDoc.createdAt).toISOString().split("T")[0],
});

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

const buildDashboardAnalytics = async (query) => {
  const { range, start, end } = resolveDashboardWindow(query);
  const trendGranularity = getTrendGranularity(range, start, end);
  const trendBuckets = buildTrendBuckets(start, end, trendGranularity);

  const deliveredOrderMatch = {
    status: "delivered",
    createdAt: { $gte: start, $lte: end },
  };
  const convertedQuoteMatch = {
    status: "converted",
    createdAt: { $gte: start, $lte: end },
  };

  const [
    productsCount,
    customersCount,
    activeOrdersCount,
    pendingQuotes,
    recentOrders,
    recentQuotes,
    deliveredOrderRevenue,
    convertedQuoteRevenue,
    orderRevenueByBucket,
    quoteRevenueByBucket,
  ] = await Promise.all([
    Product.countDocuments(),
    Customer.countDocuments({ hasAccount: true }),
    Order.countDocuments({ status: { $nin: ["delivered", "cancelled"] } }),
    Quote.countDocuments({ status: "pending" }),
    Order.find().sort({ createdAt: -1 }).limit(5),
    Quote.find().sort({ createdAt: -1 }).limit(5),
    aggregateRevenueTotal(Order, deliveredOrderMatch, "total"),
    aggregateRevenueTotal(Quote, convertedQuoteMatch, "total"),
    aggregateRevenueByBucket(Order, deliveredOrderMatch, "total", trendGranularity),
    aggregateRevenueByBucket(Quote, convertedQuoteMatch, "total", trendGranularity),
  ]);

  const revenueTrend = trendBuckets.map((bucket) => {
    const orderRevenue = orderRevenueByBucket.get(bucket.key) || 0;
    const quoteRevenue = quoteRevenueByBucket.get(bucket.key) || 0;
    return {
      label: bucket.label,
      orderRevenue,
      quoteRevenue,
      revenue: orderRevenue + quoteRevenue,
    };
  });

  const totalRevenue = deliveredOrderRevenue + convertedQuoteRevenue;

  return {
    filter: {
      range,
      startDate: toIsoDate(start),
      endDate: toIsoDate(end),
      trendGranularity,
    },
    stats: {
      revenue: totalRevenue,
      orderRevenue: deliveredOrderRevenue,
      quoteRevenue: convertedQuoteRevenue,
      orders: activeOrdersCount,
      products: productsCount,
      customers: customersCount,
    },
    pendingQuotes,
    recentOrders: recentOrders.map(formatRecentOrder),
    recentQuotes: recentQuotes.map(formatRecentQuote),
    revenueTrend,
  };
};

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const analytics = await buildDashboardAnalytics(req.query);
  res.status(200).json(
    new ApiResponse(200, "Dashboard summary fetched", {
      filter: analytics.filter,
      stats: analytics.stats,
      pendingQuotes: analytics.pendingQuotes,
      recentOrders: analytics.recentOrders,
      recentQuotes: analytics.recentQuotes,
    })
  );
});

export const getRevenueTrend = asyncHandler(async (req, res) => {
  const analytics = await buildDashboardAnalytics(req.query);
  res.status(200).json(new ApiResponse(200, "Revenue trend fetched", analytics.revenueTrend));
});

export const getCustomerSatisfaction = asyncHandler(async (req, res) => {
  const customerSatisfaction = await buildCustomerSatisfaction();
  res
    .status(200)
    .json(new ApiResponse(200, "Customer satisfaction data fetched", customerSatisfaction));
});

export const getDashboardBundle = asyncHandler(async (req, res) => {
  const [analytics, customerSatisfaction] = await Promise.all([
    buildDashboardAnalytics(req.query),
    buildCustomerSatisfaction(),
  ]);

  res.status(200).json(
    new ApiResponse(200, "Dashboard bundle fetched", {
      ...analytics,
      customerSatisfaction,
    })
  );
});
