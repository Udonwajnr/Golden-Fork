import { connectDB } from "@/lib/db/connect";
import { Order } from "@/models";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole, STAFF_ROLES } from "@/lib/auth/session";

const VALID_ITEM_STATUSES = ["pending", "preparing", "ready", "served"];

export const PATCH = withErrorHandling(async (req, { params }) => {
  await requireRole(STAFF_ROLES);
  await connectDB();
  const { id, itemId } = await params;
  const { status } = await req.json();

  if (!VALID_ITEM_STATUSES.includes(status)) {
    return fail("Invalid item status", 422);
  }

  const order = await Order.findById(id);
  if (!order) return fail("Order not found", 404);

  const item = order.items.id(itemId);
  if (!item) return fail("Order item not found", 404);

  item.status = status;

  // If every item is ready, bump the overall order status too
  if (order.items.every((i) => i.status === "ready" || i.status === "served")) {
    if (order.status === "preparing" || order.status === "accepted") {
      order.status = "ready";
      order.statusHistory.push({ status: "ready", note: "All items ready" });
    }
  }

  await order.save();
  return ok({ order });
});
