import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { ok, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES } from "@/lib/auth/session";

export const GET = withErrorHandling(async (req) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);

  const members = await User.find({ role: "customer" })
    .select("name email loyaltyPoints loyaltyTier referralCode createdAt")
    .sort({ loyaltyPoints: -1 })
    .limit(limit)
    .lean();

  const tierCounts = await User.aggregate([
    { $match: { role: "customer" } },
    { $group: { _id: "$loyaltyTier", count: { $sum: 1 } } },
  ]);

  return ok({ members, tierCounts });
});
