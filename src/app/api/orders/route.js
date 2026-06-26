import { connectDB } from "@/lib/db/connect";
import { Order, MenuItem, Coupon, Table } from "@/models";
import { checkoutSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { getCurrentUser, STAFF_ROLES } from "@/lib/auth/session";
import { calculateOrderTotals, applyCoupon } from "@/lib/pricing";
import { generateOrderNumber } from "@/lib/utils";
import { deductInventoryForOrder } from "@/lib/inventory";
import { earnPoints, redeemPoints } from "@/lib/loyalty";
import { notify, notifyAdmins } from "@/lib/notifications/dispatch";

export const POST = withErrorHandling(async (req) => {
  await connectDB();
  const user = await getCurrentUser();

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid order", 422);
  }
  const data = parsed.data;

  if (!user && !data.guestInfo) {
    return fail("Guest checkout requires name, email, and phone.", 422);
  }
  if (data.type === "delivery" && !data.deliveryAddress) {
    return fail("Delivery orders require an address.", 422);
  }
  if (data.type === "dine-in" && !data.table) {
    return fail("Dine-in orders require a table.", 422);
  }

  // Re-fetch menu items server-side so price/availability can't be spoofed from the client
  const menuItemIds = data.items.map((i) => i.menuItem);
  const dbItems = await MenuItem.find({ _id: { $in: menuItemIds } }).lean();
  const dbItemMap = new Map(dbItems.map((m) => [String(m._id), m]));

  const orderItems = [];
  for (const cartItem of data.items) {
    const dbItem = dbItemMap.get(cartItem.menuItem);
    if (!dbItem) return fail("One of the items in your cart no longer exists.", 422);
    if (!dbItem.isAvailable) {
      return fail(`${dbItem.name} is currently unavailable.`, 422);
    }
    orderItems.push({
      menuItem: dbItem._id,
      name: dbItem.name,
      price: dbItem.price,
      quantity: cartItem.quantity,
      notes: cartItem.notes || "",
    });
  }

  let coupon = null;
  if (data.couponCode) {
    coupon = await Coupon.findOne({ code: data.couponCode.toUpperCase(), isActive: true });
    if (!coupon) return fail("That coupon code is invalid or expired.", 422);
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return fail("That coupon has expired.", 422);
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return fail("That coupon has reached its usage limit.", 422);
    }
  }

  const subtotalRaw = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountFromCoupon = coupon ? applyCoupon(coupon, subtotalRaw) : 0;

  const redeemPointsRequested = Math.max(0, Math.floor(data.redeemPoints || 0));
  if (redeemPointsRequested > 0 && (!user || user.loyaltyPoints < redeemPointsRequested)) {
    return fail("You don't have enough loyalty points for that.", 422);
  }

  const totals = calculateOrderTotals({
    items: orderItems,
    type: data.type,
    discountAmount: discountFromCoupon,
    redeemPoints: redeemPointsRequested,
    tip: data.tip || 0,
  });

  const orderNumber = generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    customer: user?._id || user?.id || null,
    guestInfo: user ? undefined : data.guestInfo,
    type: data.type,
    table: data.table || undefined,
    deliveryAddress: data.deliveryAddress,
    items: orderItems,
    ...totals,
    couponCode: coupon?.code,
    loyaltyPointsRedeemed: redeemPointsRequested,
    paymentMethod: data.paymentMethod,
    paymentStatus: data.paymentMethod === "cash" ? "pending" : "paid",
    status: "placed",
    statusHistory: [{ status: "placed", note: "Order placed by customer" }],
  });

  if (coupon) {
    coupon.usedCount += 1;
    await coupon.save();
  }

  if (data.table) {
    await Table.findByIdAndUpdate(data.table, { status: "occupied" });
  }

  // Loyalty: redeem first, then earn on the net amount
  const userId = user?._id || user?.id;
  if (userId) {
    if (redeemPointsRequested > 0) {
      await redeemPoints({
        userId,
        points: redeemPointsRequested,
        orderId: order._id,
        description: `Redeemed on order ${orderNumber}`,
      });
    }
    if (totals.loyaltyPointsEarned > 0) {
      await earnPoints({
        userId,
        points: totals.loyaltyPointsEarned,
        orderId: order._id,
        description: `Earned from order ${orderNumber}`,
      });
    }
  }

  // Inventory deduction (best-effort; doesn't block order creation)
  try {
    await deductInventoryForOrder(order);
  } catch (err) {
    console.error("[inventory] deduction failed", err);
  }

  // Notifications
  const recipientEmail = user?.email || data.guestInfo?.email;
  const recipientPhone = user?.phone || data.guestInfo?.phone;
  await notify({
    recipientId: userId,
    type: "order-placed",
    title: "Order received",
    message: `Your order ${orderNumber} has been received and is awaiting confirmation. Total: $${totals.total.toFixed(2)}.`,
    relatedOrder: order._id,
    email: recipientEmail,
    phone: recipientPhone,
    forceEmail: true,
  });

  await notifyAdmins({
    type: "order-placed",
    title: "New order placed",
    message: `Order ${orderNumber} (${data.type}) — $${totals.total.toFixed(2)} — ${orderItems.length} item(s).`,
    relatedOrder: order._id,
  });

  return ok({ order }, { status: 201 });
});

export const GET = withErrorHandling(async (req) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);

  const user = await getCurrentUser();

  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;

  if (user && STAFF_ROLES.includes(user.role)) {
    // staff/admin can see all orders
  } else if (user) {
    filter.customer = user._id;
  } else {
    return fail("Sign in to view your orders.", 401);
  }

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("customer", "name email phone")
    .populate("table", "label")
    .lean();

  return ok({ orders });
});
