import { connectDB } from "@/lib/db/connect";
import { Coupon } from "@/models";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES } from "@/lib/auth/session";

export const PATCH = withErrorHandling(async (req, { params }) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const coupon = await Coupon.findByIdAndUpdate(id, body, { new: true });
  if (!coupon) return fail("Coupon not found", 404);
  return ok({ coupon });
});

export const DELETE = withErrorHandling(async (_req, { params }) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const { id } = await params;
  await Coupon.findByIdAndDelete(id);
  return ok({ message: "Coupon deleted" });
});
