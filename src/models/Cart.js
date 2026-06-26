import mongoose from "mongoose";

const { Schema } = mongoose;

const CartItemSchema = new Schema(
  {
    menuItem: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    notes: { type: String, default: "" },
  },
  { _id: true }
);

const CartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
