import mongoose from "mongoose";

const { Schema } = mongoose;

const IngredientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    unit: {
      type: String,
      required: true,
      enum: ["g", "kg", "ml", "l", "pcs", "oz", "lb"],
    },
    currentStock: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, required: true, default: 0 },
    costPerUnit: { type: Number, default: 0 },
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier" },
    isActive: { type: Boolean, default: true },
    lastRestockedAt: Date,
  },
  { timestamps: true }
);

IngredientSchema.virtual("isLowStock").get(function () {
  return this.currentStock <= this.lowStockThreshold;
});

IngredientSchema.set("toJSON", { virtuals: true });
IngredientSchema.set("toObject", { virtuals: true });

export default mongoose.models.Ingredient ||
  mongoose.model("Ingredient", IngredientSchema);
