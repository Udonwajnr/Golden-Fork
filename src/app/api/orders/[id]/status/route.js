import { connectDB } from "@/lib/db/connect";
import { Order, Table } from "@/models";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole, STAFF_ROLES } from "@/lib/auth/session";
import { notify } from "@/lib/notifications/dispatch";

const VALID_STATUSES = [
  "placed",
  "accepted",
  "rejected",
  "preparing",
  "ready",
  "out-for-delivery",
  "completed",
  "cancelled",
];

const CUSTOMER_FACING_MESSAGE = {
  accepted: "Your order has been accepted and the kitchen is getting started.",
  rejected: "Unfortunately, your order could not be accepted.",
  preparing: "Your order is being prepared in the kitchen.",
  ready: "Your order is ready!",
  "out-for-delivery": "Your order is on its way.",
  completed: "Your order is complete. Thanks for dining with us!",
  cancelled: "Your order has been cancelled.",
};

export const PATCH = withErrorHandling(async (req, { params }) => {
  const staffUser = await requireRole(STAFF_ROLES);
  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const { status, note, rejectionReason } = body;

  if (!VALID_STATUSES.includes(status)) {
    return fail("Invalid status", 422);
  }

  const order = await Order.findById(id);
  if (!order) return fail("Order not found", 404);

  order.status = status;
  order.statusHistory.push({ status, note });
  if (status === "rejected") order.rejectionReason = rejectionReason;
  if (status === "completed") order.completedAt = new Date();
  if (status === "accepted" && !order.assignedWaiter && staffUser.role === "waiter") {
    order.assignedWaiter = staffUser._id;
  }

  await order.save();

  if (["completed", "cancelled", "rejected"].includes(status) && order.table) {
    await Table.findByIdAndUpdate(order.table, { status: "cleaning" });
  }

  const message = CUSTOMER_FACING_MESSAGE[status] || `Order status updated to ${status}.`;
  await notify({
    recipientId: order.customer,
    type: "order-status",
    title: `Order ${order.orderNumber}`,
    message,
    relatedOrder: order._id,
    email: order.guestInfo?.email,
    phone: order.guestInfo?.phone,
    forceEmail: true,
  });

  return ok({ order });
});
