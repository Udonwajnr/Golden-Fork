import mongoose from "mongoose";

const { Schema } = mongoose;

const MenuCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.MenuCategory ||
  mongoose.model("MenuCategory", MenuCategorySchema);
