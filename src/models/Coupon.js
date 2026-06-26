import mongoose from "mongoose";

const { Schema } = mongoose;

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true }, // percent (0-100) or fixed dollar amount
    minOrderAmount: { type: Number, default: 0 },
    maxUses: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    maxUsesPerUser: { type: Number, default: 1 },
    startsAt: Date,
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
