import mongoose from "mongoose";

const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User" },
    channel: { type: String, enum: ["email", "sms", "in-app"], required: true },
    audience: { type: String, enum: ["customer", "admin", "staff"], default: "customer" },
    type: {
      type: String,
      enum: [
        "order-placed",
        "order-status",
        "reservation",
        "low-stock",
        "loyalty",
        "marketing",
        "system",
        "contact",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedOrder: { type: Schema.Types.ObjectId, ref: "Order" },
    isRead: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["queued", "sent", "failed"],
      default: "queued",
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ audience: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);