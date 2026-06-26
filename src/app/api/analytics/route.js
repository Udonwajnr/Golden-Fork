import { connectDB } from "@/lib/db/connect";
import { Order, User, Ingredient } from "@/models";
import { ok, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES } from "@/lib/auth/session";

export const GET = withErrorHandling(async (req) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "30d"; // 7d, 30d, 90d, all

  const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
  const days = daysMap[range];
  const since = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : new Date(0);

  const completedFilter = {
    createdAt: { $gte: since },
    status: { $nin: ["cancelled", "rejected"] },
  };

  // Revenue by day
  const revenueByDay = await Order.aggregate([
    { $match: completedFilter },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Totals
  const totals = await Order.aggregate([
    { $match: completedFilter },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: "$total" },
      },
    },
  ]);

  // Best sellers
  const bestSellers = await Order.aggregate([
    { $match: completedFilter },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        quantity: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 8 },
  ]);

  // Peak order times (hour of day)
  const peakHours = await Order.aggregate([
    { $match: completedFilter },
    {
      $group: {
        _id: { $hour: "$createdAt" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Order type split
  const orderTypeSplit = await Order.aggregate([
    { $match: completedFilter },
    { $group: { _id: "$type", count: { $sum: 1 }, revenue: { $sum: "$total" } } },
  ]);

  // Customer analytics
  const totalCustomers = await User.countDocuments({ role: "customer" });
  const newCustomers = await User.countDocuments({
    role: "customer",
    createdAt: { $gte: since },
  });

  const returningCustomerAgg = await Order.aggregate([
    { $match: { customer: { $ne: null } } },
    { $group: { _id: "$customer", orderCount: { $sum: 1 } } },
    { $match: { orderCount: { $gt: 1 } } },
    { $count: "returning" },
  ]);

  // Low stock count (quick glance metric on dashboard)
  const lowStockCount = await Ingredient.countDocuments({
    isActive: true,
    $expr: { $lte: ["$currentStock", "$lowStockThreshold"] },
  });

  const pendingOrders = await Order.countDocuments({ status: { $in: ["placed", "accepted"] } });

  return ok({
    range,
    summary: {
      revenue: totals[0]?.revenue || 0,
      orders: totals[0]?.orders || 0,
      avgOrderValue: totals[0]?.avgOrderValue || 0,
      totalCustomers,
      newCustomers,
      returningCustomers: returningCustomerAgg[0]?.returning || 0,
      lowStockCount,
      pendingOrders,
    },
    revenueByDay,
    bestSellers,
    peakHours,
    orderTypeSplit,
  });
});
