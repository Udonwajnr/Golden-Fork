import { connectDB } from "@/lib/db/connect";
import { Coupon } from "@/models";
import { couponSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES } from "@/lib/auth/session";

export const GET = withErrorHandling(async () => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  return ok({ coupons });
});

export const POST = withErrorHandling(async (req) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const body = await req.json();
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid input", 422);
  }

  const code = parsed.data.code.toUpperCase();
  const existing = await Coupon.findOne({ code });
  if (existing) return fail("A coupon with this code already exists.", 409);

  const coupon = await Coupon.create({
    ...parsed.data,
    code,
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
  });
  return ok({ coupon }, { status: 201 });
});
