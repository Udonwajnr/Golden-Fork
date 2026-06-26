import { connectDB } from "@/lib/db/connect";
import { Order } from "@/models";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { getCurrentUser, STAFF_ROLES } from "@/lib/auth/session";

export const GET = withErrorHandling(async (_req, { params }) => {
  await connectDB();
  const { id } = await params;
  const user = await getCurrentUser();

  const order = await Order.findById(id)
    .populate("customer", "name email phone")
    .populate("table", "label location")
    .populate("assignedWaiter", "name")
    .lean();

  if (!order) return fail("Order not found", 404);

  const isOwner = user && order.customer && String(order.customer._id) === String(user._id);
  const isStaff = user && STAFF_ROLES.includes(user.role);
  if (!isOwner && !isStaff) {
    return fail("You don't have access to this order.", 403);
  }

  return ok({ order });
});
