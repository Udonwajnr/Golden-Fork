import { Order, Ingredient, InventoryLog } from "@/models";

const DOW_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Builds the raw statistics that get fed into the LLM prompt (or used
 * directly as a fallback when no AI provider is configured). Keeping
 * this rule-based and deterministic means the "AI" features still work
 * (with slightly more generic phrasing) even without an API key.
 */
export async function buildSalesInsightData(days = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const filter = { createdAt: { $gte: since }, status: { $nin: ["cancelled", "rejected"] } };

  const totalAgg = await Order.aggregate([
    { $match: filter },
    { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
  ]);
  const totalRevenue = totalAgg[0]?.revenue || 0;

  const itemAgg = await Order.aggregate([
    { $match: filter },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        quantity: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
  ]);

  const dayOfWeekAgg = await Order.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { dow: { $dayOfWeek: "$createdAt" }, hour: { $hour: "$createdAt" } },
        orders: { $sum: 1 },
      },
    },
    { $sort: { orders: -1 } },
    { $limit: 5 },
  ]);

  const typeAgg = await Order.aggregate([
    { $match: filter },
    { $group: { _id: "$type", count: { $sum: 1 } } },
  ]);

  return {
    rangeDays: days,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders: totalAgg[0]?.orders || 0,
    topItems: itemAgg.map((i) => ({
      name: i._id,
      quantity: i.quantity,
      revenue: Math.round(i.revenue * 100) / 100,
      pctOfRevenue: totalRevenue ? Math.round((i.revenue / totalRevenue) * 1000) / 10 : 0,
    })),
    peakSlots: dayOfWeekAgg.map((d) => ({
      dayOfWeek: DOW_NAMES[d._id.dow - 1],
      hour: d._id.hour,
      orders: d.orders,
    })),
    orderTypeSplit: typeAgg.map((t) => ({ type: t._id, count: t.count })),
  };
}

/**
 * Forecasts days-until-stockout per ingredient using average daily usage
 * over the trailing window, derived from InventoryLog `usage` entries.
 */
export async function buildInventoryForecastData(windowDays = 14) {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const ingredients = await Ingredient.find({ isActive: true }).lean();

  const usageAgg = await InventoryLog.aggregate([
    { $match: { type: "usage", createdAt: { $gte: since } } },
    {
      $group: {
        _id: "$ingredient",
        totalUsed: { $sum: { $abs: "$quantity" } },
      },
    },
  ]);
  const usageMap = new Map(usageAgg.map((u) => [String(u._id), u.totalUsed]));

  const forecasts = ingredients.map((ing) => {
    const totalUsed = usageMap.get(String(ing._id)) || 0;
    const avgDailyUsage = totalUsed / windowDays;
    const daysUntilStockout =
      avgDailyUsage > 0 ? Math.round((ing.currentStock / avgDailyUsage) * 10) / 10 : null;

    return {
      name: ing.name,
      unit: ing.unit,
      currentStock: ing.currentStock,
      lowStockThreshold: ing.lowStockThreshold,
      avgDailyUsage: Math.round(avgDailyUsage * 100) / 100,
      daysUntilStockout,
      isLowStock: ing.currentStock <= ing.lowStockThreshold,
    };
  });

  return {
    windowDays,
    forecasts: forecasts.sort((a, b) => {
      if (a.daysUntilStockout === null) return 1;
      if (b.daysUntilStockout === null) return -1;
      return a.daysUntilStockout - b.daysUntilStockout;
    }),
  };
}

/**
 * Customer ordering pattern data: when do customers order, new vs
 * returning split, average order value trend.
 */
export async function buildCustomerInsightData(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const filter = { createdAt: { $gte: since }, status: { $nin: ["cancelled", "rejected"] } };

  const dowHourAgg = await Order.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          dow: { $dayOfWeek: "$createdAt" },
          hourBlock: { $floor: { $divide: [{ $hour: "$createdAt" }, 3] } },
        },
        orders: { $sum: 1 },
      },
    },
    { $sort: { orders: -1 } },
    { $limit: 5 },
  ]);

  const totalOrders = await Order.countDocuments(filter);

  const repeatCustomerAgg = await Order.aggregate([
    { $match: { ...filter, customer: { $ne: null } } },
    { $group: { _id: "$customer", orderCount: { $sum: 1 } } },
  ]);
  const repeatCustomers = repeatCustomerAgg.filter((c) => c.orderCount > 1).length;
  const totalUniqueCustomers = repeatCustomerAgg.length;

  return {
    rangeDays: days,
    totalOrders,
    totalUniqueCustomers,
    repeatCustomers,
    repeatRate: totalUniqueCustomers
      ? Math.round((repeatCustomers / totalUniqueCustomers) * 1000) / 10
      : 0,
    topOrderWindows: dowHourAgg.map((d) => ({
      dayOfWeek: DOW_NAMES[d._id.dow - 1],
      hourBlockStart: d._id.hourBlock * 3,
      hourBlockEnd: d._id.hourBlock * 3 + 3,
      orders: d.orders,
      pctOfTotal: totalOrders ? Math.round((d.orders / totalOrders) * 1000) / 10 : 0,
    })),
  };
}
