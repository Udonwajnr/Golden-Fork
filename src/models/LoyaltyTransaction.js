import mongoose from "mongoose";

const { Schema } = mongoose;

const LoyaltyTransactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["earn", "redeem", "referral-bonus", "adjustment", "expired"],
      required: true,
    },
    points: { type: Number, required: true }, // positive earn, negative redeem
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    description: String,
  },
  { timestamps: true }
);

export default mongoose.models.LoyaltyTransaction ||
  mongoose.model("LoyaltyTransaction", LoyaltyTransactionSchema);
