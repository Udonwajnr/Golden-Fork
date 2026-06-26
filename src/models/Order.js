import mongoose from "mongoose";

const { Schema } = mongoose;

const OrderItemSchema = new Schema(
  {
    menuItem: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
    name: { type: String, required: true }, // snapshot at order time
    price: { type: Number, required: true }, // snapshot at order time
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "served"],
      default: "pending",
    },
  },
  { _id: true }
);

const StatusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    note: String,
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User" },
    guestInfo: {
      name: String,
      email: String,
      phone: String,
    },

    type: {
      type: String,
      enum: ["delivery", "pickup", "dine-in"],
      required: true,
      default: "pickup",
    },
    table: { type: Schema.Types.ObjectId, ref: "Table" },
    deliveryAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      zip: String,
    },

    items: [OrderItemSchema],

    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: String,
    tip: { type: Number, default: 0 },
    total: { type: Number, required: true },

    loyaltyPointsEarned: { type: Number, default: 0 },
    loyaltyPointsRedeemed: { type: Number, default: 0 },

    paymentMethod: {
      type: String,
      enum: ["card", "cash", "wallet"],
      default: "card",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    status: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "rejected",
        "preparing",
        "ready",
        "out-for-delivery",
        "completed",
        "cancelled",
      ],
      default: "placed",
      index: true,
    },
    statusHistory: [StatusHistorySchema],
    rejectionReason: String,

    assignedWaiter: { type: Schema.Types.ObjectId, ref: "User" },

    estimatedReadyAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
