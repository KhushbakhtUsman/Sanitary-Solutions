import { Customer } from "../models/Customer.js";
import { Order } from "../models/Order.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const DEFAULT_REVENUE_GOAL = 320000;

export const getReportsOverview = asyncHandler(async (req, res) => {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [monthlyRevenueRows, totalCustomers, repeatCustomers, recentOrders] = await Promise.all([
    Order.aggregate([
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
    ]),
    Customer.countDocuments(),
    Customer.countDocuments({ totalOrders: { $gt: 1 } }),
    Order.find().sort({ createdAt: -1 }).limit(20),
  ]);

  const monthlyRevenue = monthlyRevenueRows[0]?.totalRevenue || 0;
  const achievedPercent =
    DEFAULT_REVENUE_GOAL > 0 ? Math.round((monthlyRevenue / DEFAULT_REVENUE_GOAL) * 100) : 0;
  const repeatCustomersRate =
    totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;

  const orders = recentOrders.map((order) => ({
    id: order.orderNumber,
    customer: order.customerSnapshot.name,
    total: order.total,
    status: order.status,
    date: new Date(order.createdAt).toISOString().split("T")[0],
  }));

  res.status(200).json(
    new ApiResponse(200, "Reports overview fetched", {
      revenueGoal: DEFAULT_REVENUE_GOAL,
      monthlyRevenue,
      achievedPercent,
      repeatCustomersRate,
      orders,
    })
  );
});
