const TAX_RATE = 0.08;
const DELIVERY_FEE = 4.99;
const FREE_DELIVERY_THRESHOLD = 60;
const POINTS_PER_DOLLAR = 10; // 10 points per $1 spent
const POINT_REDEMPTION_VALUE = 0.01; // 100 points = $1

export function calculateOrderTotals({
  items, // [{ price, quantity }]
  type,
  discountAmount = 0,
  redeemPoints = 0,
  tip = 0,
}) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;

  let deliveryFee = 0;
  if (type === "delivery") {
    deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  }

  const pointsDiscount = Math.round(redeemPoints * POINT_REDEMPTION_VALUE * 100) / 100;
  const totalDiscount = Math.min(discountAmount + pointsDiscount, subtotal);

  const total =
    Math.round((subtotal + tax + deliveryFee - totalDiscount + tip) * 100) / 100;

  const loyaltyPointsEarned = Math.max(0, Math.round(subtotal * POINTS_PER_DOLLAR));

  return {
    subtotal: round2(subtotal),
    tax,
    deliveryFee: round2(deliveryFee),
    discount: round2(totalDiscount),
    tip: round2(tip),
    total: round2(Math.max(total, 0)),
    loyaltyPointsEarned,
  };
}

export function applyCoupon(coupon, subtotal) {
  if (!coupon) return 0;
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) return 0;
  if (coupon.type === "percent") {
    return round2((subtotal * coupon.value) / 100);
  }
  return round2(Math.min(coupon.value, subtotal));
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

export const PRICING_CONSTANTS = {
  TAX_RATE,
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  POINTS_PER_DOLLAR,
  POINT_REDEMPTION_VALUE,
};
