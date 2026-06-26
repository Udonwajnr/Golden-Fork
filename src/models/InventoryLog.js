import mongoose from "mongoose";

const { Schema } = mongoose;

const InventoryLogSchema = new Schema(
  {
    ingredient: { type: Schema.Types.ObjectId, ref: "Ingredient", required: true },
    type: {
      type: String,
      enum: ["restock", "usage", "adjustment", "waste"],
      required: true,
    },
    quantity: { type: Number, required: true }, // positive for restock, negative for usage/waste
    relatedOrder: { type: Schema.Types.ObjectId, ref: "Order" },
    note: String,
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

InventoryLogSchema.index({ ingredient: 1, createdAt: -1 });

export default mongoose.models.InventoryLog ||
  mongoose.model("InventoryLog", InventoryLogSchema);
