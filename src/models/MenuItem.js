import mongoose from "mongoose";

const { Schema } = mongoose;

const RecipeIngredientSchema = new Schema(
  {
    ingredient: { type: Schema.Types.ObjectId, ref: "Ingredient", required: true },
    quantity: { type: Number, required: true }, // amount used per 1 menu item sold
    unit: { type: String, required: true }, // must match Ingredient.unit
  },
  { _id: false }
);

const MenuItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: "MenuCategory", required: true },
    imageUrl: { type: String, default: "" },

    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },

    tags: [{ type: String }], // e.g. vegan, gluten-free, spicy
    allergens: [{ type: String }],
    calories: Number,
    prepTimeMinutes: { type: Number, default: 15 },

    recipe: [RecipeIngredientSchema],

    // denormalized counters for fast analytics without aggregation on Order every time
    totalSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },

    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MenuItemSchema.index({ category: 1, isAvailable: 1 });
MenuItemSchema.index({ name: "text", description: "text", tags: "text" });

export default mongoose.models.MenuItem ||
  mongoose.model("MenuItem", MenuItemSchema);
