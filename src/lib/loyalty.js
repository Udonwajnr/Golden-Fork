import { User, LoyaltyTransaction } from "@/models";

const TIER_THRESHOLDS = [
  { tier: "platinum", minPoints: 10000 },
  { tier: "gold", minPoints: 4000 },
  { tier: "silver", minPoints: 1000 },
  { tier: "bronze", minPoints: 0 },
];

export function computeTier(totalPointsEarnedLifetime) {
  for (const t of TIER_THRESHOLDS) {
    if (totalPointsEarnedLifetime >= t.minPoints) return t.tier;
  }
  return "bronze";
}

export async function earnPoints({ userId, points, orderId, description }) {
  if (!userId || points <= 0) return;

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { loyaltyPoints: points } },
    { new: true }
  );
  if (!user) return;

  await LoyaltyTransaction.create({
    user: userId,
    type: "earn",
    points,
    order: orderId,
    description: description || "Points earned from order",
  });

  // recompute tier from lifetime earned (sum of all positive transactions)
  const lifetimeEarned = await LoyaltyTransaction.aggregate([
    { $match: { user: user._id, points: { $gt: 0 } } },
    { $group: { _id: null, total: { $sum: "$points" } } },
  ]);
  const total = lifetimeEarned[0]?.total || 0;
  const newTier = computeTier(total);
  if (newTier !== user.loyaltyTier) {
    user.loyaltyTier = newTier;
    await user.save();
  }

  return user;
}

export async function redeemPoints({ userId, points, orderId, description }) {
  if (!userId || points <= 0) return;

  const user = await User.findById(userId);
  if (!user || user.loyaltyPoints < points) {
    throw Object.assign(new Error("Not enough loyalty points"), { status: 422 });
  }

  user.loyaltyPoints -= points;
  await user.save();

  await LoyaltyTransaction.create({
    user: userId,
    type: "redeem",
    points: -points,
    order: orderId,
    description: description || "Points redeemed at checkout",
  });

  return user;
}

export async function awardReferralBonus(newUser) {
  if (!newUser.referredBy) return;
  const BONUS = 500;
  await earnPoints({
    userId: newUser.referredBy,
    points: BONUS,
    description: `Referral bonus for inviting ${newUser.name}`,
  });
}
