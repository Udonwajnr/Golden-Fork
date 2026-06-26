/**
 * Seed script for The Golden Fork.
 * Run with: node scripts/seed.js
 * Requires MONGODB_URI in .env.local (loaded via dotenv below).
 */
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "golden_fork";

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Add it to .env.local first.");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
  console.log("Connected to MongoDB:", MONGODB_DB);

  const db = mongoose.connection;

  // --- Clear existing demo data (safe for a fresh dev DB) ---
  const collections = [
    "users",
    "menucategories",
    "menuitems",
    "ingredients",
    "suppliers",
    "tables",
    "coupons",
  ];
  for (const c of collections) {
    if (db.collections[c]) await db.collections[c].deleteMany({});
  }

  // --- Staff accounts ---
  const passwordHash = await bcrypt.hash("password123", 10);
  const usersCol = db.collection("users");
  await usersCol.insertMany([
    {
      name: "Admin User",
      email: "admin@goldenfork.com",
      passwordHash,
      role: "admin",
      isActive: true,
      loyaltyPoints: 0,
      loyaltyTier: "bronze",
      notifyByEmail: true,
      notifyBySms: false,
      referralCode: "ADMIN0001",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Priya Manager",
      email: "manager@goldenfork.com",
      passwordHash,
      role: "manager",
      isActive: true,
      loyaltyPoints: 0,
      loyaltyTier: "bronze",
      notifyByEmail: true,
      notifyBySms: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Maria Waiter",
      email: "waiter@goldenfork.com",
      passwordHash,
      role: "waiter",
      isActive: true,
      loyaltyPoints: 0,
      loyaltyTier: "bronze",
      notifyByEmail: true,
      notifyBySms: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Jordan Waiter",
      email: "waiter2@goldenfork.com",
      passwordHash,
      role: "waiter",
      isActive: true,
      loyaltyPoints: 0,
      loyaltyTier: "bronze",
      notifyByEmail: true,
      notifyBySms: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Sam Kitchen",
      email: "kitchen@goldenfork.com",
      passwordHash,
      role: "kitchen",
      isActive: true,
      loyaltyPoints: 0,
      loyaltyTier: "bronze",
      notifyByEmail: true,
      notifyBySms: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Alex Kitchen",
      email: "kitchen2@goldenfork.com",
      passwordHash,
      role: "kitchen",
      isActive: true,
      loyaltyPoints: 0,
      loyaltyTier: "bronze",
      notifyByEmail: true,
      notifyBySms: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("Created staff accounts (password: password123)");
  console.log("  admin@goldenfork.com (admin)");
  console.log("  manager@goldenfork.com (manager)");
  console.log("  waiter@goldenfork.com / waiter2@goldenfork.com (waiter)");
  console.log("  kitchen@goldenfork.com / kitchen2@goldenfork.com (kitchen)");

  // --- Suppliers ---
  const suppliersCol = db.collection("suppliers");
  const supplierDefs = [
    { name: "Coastal Seafood Co.", contactName: "Lena Ortiz", email: "orders@coastalseafood.com", phone: "555-0101" },
    { name: "Greenfield Farms", contactName: "Tom Reyes", email: "sales@greenfieldfarms.com", phone: "555-0102" },
    { name: "Prime Meat Supply", contactName: "Dana Kim", email: "info@primemeat.com", phone: "555-0103" },
    { name: "Sunrise Produce", contactName: "Carla Nunez", email: "orders@sunriseproduce.com", phone: "555-0104" },
    { name: "Artisan Bakehouse", contactName: "Felix Grant", email: "hello@artisanbakehouse.com", phone: "555-0105" },
    { name: "Golden Valley Dairy", contactName: "Ines Park", email: "sales@goldenvalleydairy.com", phone: "555-0106" },
    { name: "Harbor Wine & Beverage", contactName: "Marcus Lowe", email: "orders@harborbev.com", phone: "555-0107" },
  ];
  const supplierResult = await suppliersCol.insertMany(
    supplierDefs.map((s) => ({ ...s, address: "", notes: "", isActive: true, createdAt: new Date(), updatedAt: new Date() }))
  );
  const supplierIds = Object.values(supplierResult.insertedIds);
  const sup = (idx) => supplierIds[idx];

  // --- Ingredients ---
  const ingredientsCol = db.collection("ingredients");
  const ingredientDefs = [
    { name: "Chicken Breast", unit: "kg", currentStock: 28, lowStockThreshold: 6, costPerUnit: 6.5, supplier: sup(2) },
    { name: "Duck Breast", unit: "kg", currentStock: 9, lowStockThreshold: 3, costPerUnit: 19, supplier: sup(2) },
    { name: "Wagyu Striploin", unit: "kg", currentStock: 6, lowStockThreshold: 2, costPerUnit: 65, supplier: sup(2) },
    { name: "Beef Short Rib", unit: "kg", currentStock: 10, lowStockThreshold: 3, costPerUnit: 24, supplier: sup(2) },
    { name: "Beef Tenderloin", unit: "kg", currentStock: 8, lowStockThreshold: 2.5, costPerUnit: 38, supplier: sup(2) },
    { name: "Pork Belly", unit: "kg", currentStock: 11, lowStockThreshold: 3, costPerUnit: 14, supplier: sup(2) },
    { name: "Lamb Rack", unit: "kg", currentStock: 7, lowStockThreshold: 2, costPerUnit: 32, supplier: sup(2) },
    { name: "Scallops", unit: "kg", currentStock: 8, lowStockThreshold: 3, costPerUnit: 22, supplier: sup(0) },
    { name: "Salmon Fillet", unit: "kg", currentStock: 14, lowStockThreshold: 4, costPerUnit: 17, supplier: sup(0) },
    { name: "Tuna Loin", unit: "kg", currentStock: 9, lowStockThreshold: 3, costPerUnit: 26, supplier: sup(0) },
    { name: "Sea Bass", unit: "kg", currentStock: 10, lowStockThreshold: 3, costPerUnit: 21, supplier: sup(0) },
    { name: "Lobster Tail", unit: "kg", currentStock: 5, lowStockThreshold: 2, costPerUnit: 48, supplier: sup(0) },
    { name: "Jumbo Shrimp", unit: "kg", currentStock: 9, lowStockThreshold: 3, costPerUnit: 19, supplier: sup(0) },
    { name: "Mussels", unit: "kg", currentStock: 8, lowStockThreshold: 2.5, costPerUnit: 9, supplier: sup(0) },
    { name: "Calamari", unit: "kg", currentStock: 6, lowStockThreshold: 2, costPerUnit: 11, supplier: sup(0) },
    { name: "Foie Gras", unit: "kg", currentStock: 2.5, lowStockThreshold: 1, costPerUnit: 85, supplier: sup(2) },
    { name: "Eggs", unit: "pcs", currentStock: 180, lowStockThreshold: 36, costPerUnit: 0.3, supplier: sup(5) },
    { name: "Heavy Cream", unit: "l", currentStock: 14, lowStockThreshold: 4, costPerUnit: 4.2, supplier: sup(5) },
    { name: "Butter", unit: "kg", currentStock: 12, lowStockThreshold: 3, costPerUnit: 7.4, supplier: sup(5) },
    { name: "Parmesan", unit: "kg", currentStock: 5, lowStockThreshold: 1.5, costPerUnit: 18, supplier: sup(5) },
    { name: "Burrata", unit: "kg", currentStock: 3, lowStockThreshold: 1, costPerUnit: 16, supplier: sup(5) },
    { name: "Goat Cheese", unit: "kg", currentStock: 3, lowStockThreshold: 1, costPerUnit: 15, supplier: sup(5) },
    { name: "Mascarpone", unit: "kg", currentStock: 4, lowStockThreshold: 1, costPerUnit: 9.5, supplier: sup(5) },
    { name: "Blue Cheese", unit: "kg", currentStock: 2.5, lowStockThreshold: 1, costPerUnit: 17, supplier: sup(5) },
    { name: "Whole Milk", unit: "l", currentStock: 10, lowStockThreshold: 3, costPerUnit: 1.4, supplier: sup(5) },
    { name: "Vanilla Ice Cream", unit: "kg", currentStock: 6, lowStockThreshold: 2, costPerUnit: 8.5, supplier: sup(5) },
    { name: "Fettuccine Pasta", unit: "kg", currentStock: 16, lowStockThreshold: 4, costPerUnit: 3.1, supplier: sup(1) },
    { name: "Spaghetti", unit: "kg", currentStock: 16, lowStockThreshold: 4, costPerUnit: 2.8, supplier: sup(1) },
    { name: "Risotto Rice", unit: "kg", currentStock: 12, lowStockThreshold: 3, costPerUnit: 4.6, supplier: sup(1) },
    { name: "Gnocchi", unit: "kg", currentStock: 9, lowStockThreshold: 3, costPerUnit: 4.1, supplier: sup(1) },
    { name: "All-Purpose Flour", unit: "kg", currentStock: 20, lowStockThreshold: 5, costPerUnit: 1.1, supplier: sup(4) },
    { name: "Brioche Buns", unit: "pcs", currentStock: 60, lowStockThreshold: 12, costPerUnit: 0.9, supplier: sup(4) },
    { name: "Sourdough Bread", unit: "pcs", currentStock: 20, lowStockThreshold: 5, costPerUnit: 3.4, supplier: sup(4) },
    { name: "Pizza Dough Ball", unit: "pcs", currentStock: 30, lowStockThreshold: 8, costPerUnit: 1.6, supplier: sup(4) },
    { name: "Dark Chocolate", unit: "kg", currentStock: 6, lowStockThreshold: 1.5, costPerUnit: 14, supplier: sup(1) },
    { name: "Sugar", unit: "kg", currentStock: 18, lowStockThreshold: 4, costPerUnit: 1.2, supplier: sup(1) },
    { name: "Honey", unit: "l", currentStock: 5, lowStockThreshold: 1.5, costPerUnit: 9.8, supplier: sup(1) },
    { name: "Truffle Oil", unit: "ml", currentStock: 600, lowStockThreshold: 150, costPerUnit: 0.12, supplier: sup(1) },
    { name: "Espresso Beans", unit: "kg", currentStock: 8, lowStockThreshold: 2, costPerUnit: 22, supplier: sup(1) },
    { name: "Mixed Greens", unit: "kg", currentStock: 9, lowStockThreshold: 2.5, costPerUnit: 5.5, supplier: sup(3) },
    { name: "Tomatoes", unit: "kg", currentStock: 14, lowStockThreshold: 3, costPerUnit: 3.2, supplier: sup(3) },
    { name: "Avocado", unit: "pcs", currentStock: 40, lowStockThreshold: 10, costPerUnit: 1.1, supplier: sup(3) },
    { name: "Mushrooms", unit: "kg", currentStock: 11, lowStockThreshold: 3, costPerUnit: 6.8, supplier: sup(3) },
    { name: "Asparagus", unit: "kg", currentStock: 7, lowStockThreshold: 2, costPerUnit: 7.9, supplier: sup(3) },
    { name: "Beets", unit: "kg", currentStock: 8, lowStockThreshold: 2, costPerUnit: 3.5, supplier: sup(3) },
    { name: "Pumpkin", unit: "kg", currentStock: 10, lowStockThreshold: 2.5, costPerUnit: 2.6, supplier: sup(3) },
    { name: "Lemons", unit: "pcs", currentStock: 60, lowStockThreshold: 15, costPerUnit: 0.4, supplier: sup(3) },
    { name: "Strawberries", unit: "kg", currentStock: 6, lowStockThreshold: 2, costPerUnit: 7.2, supplier: sup(3) },
    { name: "Garlic", unit: "kg", currentStock: 5, lowStockThreshold: 1, costPerUnit: 5.1, supplier: sup(3) },
    { name: "Potatoes", unit: "kg", currentStock: 25, lowStockThreshold: 6, costPerUnit: 1.5, supplier: sup(3) },
    { name: "House Red Wine", unit: "l", currentStock: 24, lowStockThreshold: 6, costPerUnit: 9.5, supplier: sup(6) },
    { name: "House White Wine", unit: "l", currentStock: 24, lowStockThreshold: 6, costPerUnit: 9.5, supplier: sup(6) },
    { name: "Sparkling Water", unit: "l", currentStock: 30, lowStockThreshold: 8, costPerUnit: 0.8, supplier: sup(6) },
    { name: "Orange Juice", unit: "l", currentStock: 12, lowStockThreshold: 3, costPerUnit: 2.1, supplier: sup(6) },
  ];
  const ingredientResult = await ingredientsCol.insertMany(
    ingredientDefs.map((i) => ({ ...i, isActive: true, lastRestockedAt: new Date(), createdAt: new Date(), updatedAt: new Date() }))
  );
  const ingredientIds = Object.values(ingredientResult.insertedIds);
  const ing = Object.fromEntries(ingredientDefs.map((i, idx) => [i.name, ingredientIds[idx]]));

  // --- Categories ---
  const categoriesCol = db.collection("menucategories");
  const categoryDefs = [
    { name: "Starters", slug: "starters", sortOrder: 1 },
    { name: "Salads & Soups", slug: "salads-soups", sortOrder: 2 },
    { name: "Mains", slug: "mains", sortOrder: 3 },
    { name: "Seafood", slug: "seafood", sortOrder: 4 },
    { name: "Pasta & Risotto", slug: "pasta-risotto", sortOrder: 5 },
    { name: "Pizza", slug: "pizza", sortOrder: 6 },
    { name: "Sides", slug: "sides", sortOrder: 7 },
    { name: "Desserts", slug: "desserts", sortOrder: 8 },
    { name: "Beverages", slug: "beverages", sortOrder: 9 },
  ];
  const categoryResult = await categoriesCol.insertMany(
    categoryDefs.map((c) => ({ ...c, description: "", isActive: true, createdAt: new Date(), updatedAt: new Date() }))
  );
  const categoryIds = Object.values(categoryResult.insertedIds);
  const cat = Object.fromEntries(categoryDefs.map((c, idx) => [c.name, categoryIds[idx]]));

  // --- Menu items (50) ---
  const menuItemsCol = db.collection("menuitems");
  const item = (
    name,
    slug,
    description,
    price,
    categoryName,
    imageUrl,
    { tags = [], allergens = [], prepTimeMinutes = 15, isFeatured = false, recipe = [] } = {}
  ) => ({
    name,
    slug,
    description,
    price,
    category: cat[categoryName],
    imageUrl,
    isAvailable: true,
    isFeatured,
    tags,
    allergens,
    prepTimeMinutes,
    recipe,
    totalSold: 0,
    totalRevenue: 0,
    ratingAvg: 0,
    ratingCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const menuItemDefs = [
    item(
      "Seared Scallops", "seared-scallops",
      "Pan-seared scallops over pea purée, finished with brown butter.",
      24, "Starters", "https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=800",
      { tags: ["seafood", "gluten-free"], allergens: ["shellfish"], prepTimeMinutes: 18, isFeatured: true,
        recipe: [{ ingredient: ing.Scallops, quantity: 0.15, unit: "kg" }, { ingredient: ing.Butter, quantity: 0.02, unit: "kg" }] }
    ),
    item(
      "Foie Gras Torchon", "foie-gras-torchon",
      "House-cured foie gras, brioche toast, fig compote.",
      28, "Starters", "https://images.unsplash.com/photo-1432139509613-5c4255815697?q=80&w=800",
      { tags: ["signature"], allergens: ["gluten"], prepTimeMinutes: 12, isFeatured: true,
        recipe: [{ ingredient: ing["Foie Gras"], quantity: 0.1, unit: "kg" }, { ingredient: ing["Brioche Buns"], quantity: 1, unit: "pcs" }] }
    ),
    item(
      "Tuna Tartare", "tuna-tartare",
      "Hand-cut tuna, avocado, citrus soy, crispy wonton.",
      22, "Starters", "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=800",
      { tags: ["seafood", "raw"], allergens: ["fish", "soy"], prepTimeMinutes: 14,
        recipe: [{ ingredient: ing["Tuna Loin"], quantity: 0.12, unit: "kg" }, { ingredient: ing.Avocado, quantity: 1, unit: "pcs" }] }
    ),
    item(
      "Crispy Pork Belly Bites", "crispy-pork-belly-bites",
      "Slow-braised pork belly, charred apple, mustard glaze.",
      19, "Starters", "https://images.unsplash.com/photo-1432139555190-58524dae6a55?q=80&w=800",
      { tags: ["pork"], allergens: [], prepTimeMinutes: 20,
        recipe: [{ ingredient: ing["Pork Belly"], quantity: 0.2, unit: "kg" }] }
    ),
    item(
      "Burrata & Heirloom Tomato", "burrata-heirloom-tomato",
      "Creamy burrata, heirloom tomatoes, basil oil, sea salt.",
      18, "Starters", "https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=800",
      { tags: ["vegetarian"], allergens: ["dairy"], prepTimeMinutes: 8,
        recipe: [{ ingredient: ing.Burrata, quantity: 0.12, unit: "kg" }, { ingredient: ing.Tomatoes, quantity: 0.15, unit: "kg" }] }
    ),
    item(
      "Crispy Calamari", "crispy-calamari",
      "Lightly fried calamari, lemon aioli, chili flakes.",
      17, "Starters", "https://images.unsplash.com/photo-1639024471283-03518883512d?q=80&w=800",
      { tags: ["seafood", "spicy"], allergens: ["shellfish", "gluten"], prepTimeMinutes: 12,
        recipe: [{ ingredient: ing.Calamari, quantity: 0.18, unit: "kg" }] }
    ),
    item(
      "Steamed Mussels", "steamed-mussels",
      "White wine, garlic, parsley, grilled sourdough.",
      19, "Starters", "https://images.unsplash.com/photo-1606850780554-b55ea4dd0b70?q=80&w=800",
      { tags: ["seafood"], allergens: ["shellfish", "gluten"], prepTimeMinutes: 15,
        recipe: [{ ingredient: ing.Mussels, quantity: 0.4, unit: "kg" }, { ingredient: ing["House White Wine"], quantity: 0.1, unit: "l" }] }
    ),
    item(
      "Roasted Beet Salad", "roasted-beet-salad",
      "Roasted beets, goat cheese, candied walnuts, mixed greens.",
      16, "Salads & Soups", "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800",
      { tags: ["vegetarian", "gluten-free"], allergens: ["dairy", "nuts"], prepTimeMinutes: 10,
        recipe: [{ ingredient: ing.Beets, quantity: 0.15, unit: "kg" }, { ingredient: ing["Goat Cheese"], quantity: 0.05, unit: "kg" }] }
    ),
    item(
      "Caesar Salad", "caesar-salad",
      "Romaine, parmesan, garlic croutons, classic dressing.",
      15, "Salads & Soups", "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=800",
      { tags: ["classic"], allergens: ["dairy", "gluten", "egg"], prepTimeMinutes: 9,
        recipe: [{ ingredient: ing["Mixed Greens"], quantity: 0.12, unit: "kg" }, { ingredient: ing.Parmesan, quantity: 0.03, unit: "kg" }] }
    ),
    item(
      "Asparagus & Burrata Salad", "asparagus-burrata-salad",
      "Charred asparagus, burrata, lemon vinaigrette.",
      18, "Salads & Soups", "https://images.unsplash.com/photo-1572441713132-51c75654db73?q=80&w=800",
      { tags: ["vegetarian"], allergens: ["dairy"], prepTimeMinutes: 11,
        recipe: [{ ingredient: ing.Asparagus, quantity: 0.15, unit: "kg" }, { ingredient: ing.Burrata, quantity: 0.1, unit: "kg" }] }
    ),
    item(
      "Roasted Pumpkin Soup", "roasted-pumpkin-soup",
      "Velvety pumpkin soup, brown butter, toasted seeds.",
      13, "Salads & Soups", "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?q=80&w=800",
      { tags: ["vegetarian", "seasonal"], allergens: ["dairy"], prepTimeMinutes: 14,
        recipe: [{ ingredient: ing.Pumpkin, quantity: 0.3, unit: "kg" }, { ingredient: ing["Heavy Cream"], quantity: 0.08, unit: "l" }] }
    ),
    item(
      "French Onion Soup", "french-onion-soup",
      "Caramelized onions, rich beef broth, gruyère crust.",
      14, "Salads & Soups", "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800",
      { tags: ["classic"], allergens: ["dairy", "gluten"], prepTimeMinutes: 16,
        recipe: [{ ingredient: ing["Sourdough Bread"], quantity: 1, unit: "pcs" }, { ingredient: ing.Parmesan, quantity: 0.04, unit: "kg" }] }
    ),
    item(
      "Mushroom Bisque", "mushroom-bisque",
      "Wild mushroom bisque, truffle oil, chive crème fraîche.",
      14, "Salads & Soups", "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800",
      { tags: ["vegetarian"], allergens: ["dairy"], prepTimeMinutes: 13,
        recipe: [{ ingredient: ing.Mushrooms, quantity: 0.25, unit: "kg" }, { ingredient: ing["Heavy Cream"], quantity: 0.1, unit: "l" }, { ingredient: ing["Truffle Oil"], quantity: 5, unit: "ml" }] }
    ),
    item(
      "Wagyu Striploin", "wagyu-striploin",
      "A5 Wagyu striploin, roasted fingerling potatoes, red wine jus.",
      68, "Mains", "https://images.unsplash.com/photo-1432139555190-58524dae6a55?q=80&w=800",
      { tags: ["beef", "signature"], allergens: [], prepTimeMinutes: 25, isFeatured: true,
        recipe: [{ ingredient: ing["Wagyu Striploin"], quantity: 0.25, unit: "kg" }, { ingredient: ing.Potatoes, quantity: 0.2, unit: "kg" }] }
    ),
    item(
      "Truffle Chicken", "truffle-chicken",
      "Free-range chicken breast, truffle cream sauce, seasonal greens.",
      32, "Mains", "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800",
      { tags: ["poultry"], allergens: ["dairy"], prepTimeMinutes: 22,
        recipe: [
          { ingredient: ing["Chicken Breast"], quantity: 0.3, unit: "kg" },
          { ingredient: ing["Heavy Cream"], quantity: 0.1, unit: "l" },
          { ingredient: ing["Truffle Oil"], quantity: 10, unit: "ml" },
        ] }
    ),
    item(
      "Braised Short Rib", "braised-short-rib",
      "12-hour braised short rib, root vegetable mash, jus.",
      38, "Mains", "https://images.unsplash.com/photo-1432139555190-58524dae6a55?q=80&w=800",
      { tags: ["beef", "comfort"], allergens: [], prepTimeMinutes: 30,
        recipe: [{ ingredient: ing["Beef Short Rib"], quantity: 0.35, unit: "kg" }, { ingredient: ing.Potatoes, quantity: 0.2, unit: "kg" }] }
    ),
    item(
      "Filet Mignon", "filet-mignon",
      "Beef tenderloin, garlic butter, roasted asparagus.",
      45, "Mains", "https://images.unsplash.com/photo-1546964124-0cce460f38ef?q=80&w=800",
      { tags: ["beef", "signature"], allergens: ["dairy"], prepTimeMinutes: 20, isFeatured: true,
        recipe: [{ ingredient: ing["Beef Tenderloin"], quantity: 0.22, unit: "kg" }, { ingredient: ing.Asparagus, quantity: 0.1, unit: "kg" }] }
    ),
    item(
      "Crispy Duck Breast", "crispy-duck-breast",
      "Pan-roasted duck breast, cherry gastrique, parsnip purée.",
      36, "Mains", "https://images.unsplash.com/photo-1432139509613-5c4255815697?q=80&w=800",
      { tags: ["poultry"], allergens: [], prepTimeMinutes: 24,
        recipe: [{ ingredient: ing["Duck Breast"], quantity: 0.25, unit: "kg" }] }
    ),
    item(
      "Herb-Crusted Lamb Rack", "herb-crusted-lamb-rack",
      "New Zealand lamb rack, herb crust, mint jus, ratatouille.",
      42, "Mains", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800",
      { tags: ["lamb", "signature"], allergens: ["gluten"], prepTimeMinutes: 26,
        recipe: [{ ingredient: ing["Lamb Rack"], quantity: 0.3, unit: "kg" }] }
    ),
    item(
      "Classic Cheeseburger", "classic-cheeseburger",
      "Beef patty, aged cheddar, brioche bun, house sauce, fries.",
      21, "Mains", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800",
      { tags: ["classic", "popular"], allergens: ["dairy", "gluten"], prepTimeMinutes: 16,
        recipe: [{ ingredient: ing["Beef Tenderloin"], quantity: 0.18, unit: "kg" }, { ingredient: ing["Brioche Buns"], quantity: 1, unit: "pcs" }] }
    ),
    item(
      "Grilled Vegetable Stack", "grilled-vegetable-stack",
      "Seasonal grilled vegetables, romesco sauce, herb oil.",
      24, "Mains", "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800",
      { tags: ["vegetarian", "vegan", "gluten-free"], allergens: [], prepTimeMinutes: 18,
        recipe: [{ ingredient: ing.Mushrooms, quantity: 0.15, unit: "kg" }, { ingredient: ing.Asparagus, quantity: 0.1, unit: "kg" }] }
    ),
    item(
      "BBQ Pork Ribs", "bbq-pork-ribs",
      "Slow-smoked pork ribs, house BBQ glaze, slaw.",
      29, "Mains", "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800",
      { tags: ["pork"], allergens: [], prepTimeMinutes: 28,
        recipe: [{ ingredient: ing["Pork Belly"], quantity: 0.35, unit: "kg" }] }
    ),
    item(
      "Grilled Sea Bass", "grilled-sea-bass",
      "Whole grilled sea bass, lemon herb butter, charred greens.",
      34, "Seafood", "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800",
      { tags: ["seafood", "gluten-free"], allergens: ["fish", "dairy"], prepTimeMinutes: 22,
        recipe: [{ ingredient: ing["Sea Bass"], quantity: 0.35, unit: "kg" }, { ingredient: ing.Lemons, quantity: 1, unit: "pcs" }] }
    ),
    item(
      "Butter-Poached Lobster", "butter-poached-lobster",
      "Lobster tail poached in herb butter, citrus beurre blanc.",
      52, "Seafood", "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?q=80&w=800",
      { tags: ["seafood", "signature"], allergens: ["shellfish", "dairy"], prepTimeMinutes: 20, isFeatured: true,
        recipe: [{ ingredient: ing["Lobster Tail"], quantity: 0.3, unit: "kg" }, { ingredient: ing.Butter, quantity: 0.05, unit: "kg" }] }
    ),
    item(
      "Pan-Seared Salmon", "pan-seared-salmon",
      "Crispy-skin salmon, lentils, salsa verde.",
      29, "Seafood", "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=800",
      { tags: ["seafood", "gluten-free"], allergens: ["fish"], prepTimeMinutes: 18,
        recipe: [{ ingredient: ing["Salmon Fillet"], quantity: 0.25, unit: "kg" }] }
    ),
    item(
      "Garlic Butter Shrimp", "garlic-butter-shrimp",
      "Jumbo shrimp, garlic butter, chili flakes, crusty bread.",
      27, "Seafood", "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800",
      { tags: ["seafood", "spicy"], allergens: ["shellfish", "gluten"], prepTimeMinutes: 14,
        recipe: [{ ingredient: ing["Jumbo Shrimp"], quantity: 0.25, unit: "kg" }, { ingredient: ing.Butter, quantity: 0.04, unit: "kg" }] }
    ),
    item(
      "Seafood Platter", "seafood-platter",
      "Lobster, scallops, shrimp, and mussels — chef's selection.",
      58, "Seafood", "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?q=80&w=800",
      { tags: ["seafood", "sharing"], allergens: ["shellfish"], prepTimeMinutes: 28,
        recipe: [
          { ingredient: ing["Lobster Tail"], quantity: 0.2, unit: "kg" },
          { ingredient: ing.Scallops, quantity: 0.15, unit: "kg" },
          { ingredient: ing["Jumbo Shrimp"], quantity: 0.15, unit: "kg" },
          { ingredient: ing.Mussels, quantity: 0.2, unit: "kg" },
        ] }
    ),
    item(
      "Ahi Tuna Steak", "ahi-tuna-steak",
      "Seared ahi tuna, sesame crust, wasabi aioli, pickled ginger.",
      31, "Seafood", "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=800",
      { tags: ["seafood", "gluten-free"], allergens: ["fish", "sesame"], prepTimeMinutes: 16,
        recipe: [{ ingredient: ing["Tuna Loin"], quantity: 0.22, unit: "kg" }] }
    ),
    item(
      "Chicken Alfredo", "chicken-alfredo",
      "Fettuccine in a rich parmesan cream sauce with grilled chicken.",
      26, "Pasta & Risotto", "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=800",
      { tags: ["pasta", "popular"], allergens: ["dairy", "gluten"], prepTimeMinutes: 16, isFeatured: true,
        recipe: [
          { ingredient: ing["Fettuccine Pasta"], quantity: 0.18, unit: "kg" },
          { ingredient: ing["Chicken Breast"], quantity: 0.15, unit: "kg" },
          { ingredient: ing["Heavy Cream"], quantity: 0.12, unit: "l" },
          { ingredient: ing.Parmesan, quantity: 0.05, unit: "kg" },
        ] }
    ),
    item(
      "Spaghetti Bolognese", "spaghetti-bolognese",
      "Slow-simmered beef ragù, spaghetti, parmesan.",
      22, "Pasta & Risotto", "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800",
      { tags: ["pasta", "classic"], allergens: ["gluten", "dairy"], prepTimeMinutes: 18,
        recipe: [{ ingredient: ing.Spaghetti, quantity: 0.18, unit: "kg" }, { ingredient: ing["Beef Short Rib"], quantity: 0.12, unit: "kg" }] }
    ),
    item(
      "Wild Mushroom Risotto", "wild-mushroom-risotto",
      "Creamy arborio risotto, wild mushrooms, truffle oil, parmesan.",
      27, "Pasta & Risotto", "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=800",
      { tags: ["vegetarian", "gluten-free"], allergens: ["dairy"], prepTimeMinutes: 22,
        recipe: [{ ingredient: ing["Risotto Rice"], quantity: 0.2, unit: "kg" }, { ingredient: ing.Mushrooms, quantity: 0.15, unit: "kg" }, { ingredient: ing["Truffle Oil"], quantity: 8, unit: "ml" }] }
    ),
    item(
      "Lobster Ravioli", "lobster-ravioli",
      "House-made ravioli, lobster filling, brown butter sage sauce.",
      34, "Pasta & Risotto", "https://images.unsplash.com/photo-1556761223-4c4282c73f77?q=80&w=800",
      { tags: ["pasta", "seafood", "signature"], allergens: ["shellfish", "gluten", "egg"], prepTimeMinutes: 20,
        recipe: [{ ingredient: ing["Lobster Tail"], quantity: 0.15, unit: "kg" }, { ingredient: ing["All-Purpose Flour"], quantity: 0.2, unit: "kg" }, { ingredient: ing.Butter, quantity: 0.04, unit: "kg" }] }
    ),
    item(
      "Truffle Gnocchi", "truffle-gnocchi",
      "Pillowy potato gnocchi, truffle cream sauce, parmesan.",
      25, "Pasta & Risotto", "https://images.unsplash.com/photo-1587740908075-9e245070dfaa?q=80&w=800",
      { tags: ["vegetarian"], allergens: ["dairy", "gluten"], prepTimeMinutes: 16,
        recipe: [{ ingredient: ing.Gnocchi, quantity: 0.2, unit: "kg" }, { ingredient: ing["Heavy Cream"], quantity: 0.1, unit: "l" }, { ingredient: ing["Truffle Oil"], quantity: 8, unit: "ml" }] }
    ),
    item(
      "Seafood Linguine", "seafood-linguine",
      "Linguine, shrimp, mussels, calamari, white wine garlic sauce.",
      31, "Pasta & Risotto", "https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=800",
      { tags: ["pasta", "seafood"], allergens: ["shellfish", "gluten"], prepTimeMinutes: 20,
        recipe: [
          { ingredient: ing.Spaghetti, quantity: 0.18, unit: "kg" },
          { ingredient: ing["Jumbo Shrimp"], quantity: 0.1, unit: "kg" },
          { ingredient: ing.Mussels, quantity: 0.1, unit: "kg" },
          { ingredient: ing.Calamari, quantity: 0.1, unit: "kg" },
        ] }
    ),
    item(
      "Margherita Pizza", "margherita-pizza",
      "San Marzano tomato, fresh mozzarella, basil, olive oil.",
      19, "Pizza", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800",
      { tags: ["vegetarian", "classic"], allergens: ["dairy", "gluten"], prepTimeMinutes: 14,
        recipe: [{ ingredient: ing["Pizza Dough Ball"], quantity: 1, unit: "pcs" }, { ingredient: ing.Tomatoes, quantity: 0.1, unit: "kg" }] }
    ),
    item(
      "Truffle Mushroom Pizza", "truffle-mushroom-pizza",
      "Wild mushrooms, fontina, truffle oil, arugula.",
      24, "Pizza", "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800",
      { tags: ["vegetarian", "signature"], allergens: ["dairy", "gluten"], prepTimeMinutes: 16,
        recipe: [{ ingredient: ing["Pizza Dough Ball"], quantity: 1, unit: "pcs" }, { ingredient: ing.Mushrooms, quantity: 0.12, unit: "kg" }, { ingredient: ing["Truffle Oil"], quantity: 6, unit: "ml" }] }
    ),
    item(
      "Prosciutto & Burrata Pizza", "prosciutto-burrata-pizza",
      "Prosciutto, burrata, arugula, balsamic glaze.",
      23, "Pizza", "https://images.unsplash.com/photo-1601924928357-f24ed8a4e545?q=80&w=800",
      { tags: ["popular"], allergens: ["dairy", "gluten"], prepTimeMinutes: 14,
        recipe: [{ ingredient: ing["Pizza Dough Ball"], quantity: 1, unit: "pcs" }, { ingredient: ing.Burrata, quantity: 0.1, unit: "kg" }] }
    ),
    item(
      "Spicy Pepperoni Pizza", "spicy-pepperoni-pizza",
      "Double pepperoni, chili honey, mozzarella.",
      22, "Pizza", "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800",
      { tags: ["spicy", "popular"], allergens: ["dairy", "gluten"], prepTimeMinutes: 14,
        recipe: [{ ingredient: ing["Pizza Dough Ball"], quantity: 1, unit: "pcs" }, { ingredient: ing.Honey, quantity: 0.02, unit: "l" }] }
    ),
    item(
      "Garden Veggie Pizza", "garden-veggie-pizza",
      "Seasonal vegetables, mozzarella, herb-infused olive oil.",
      20, "Pizza", "https://images.unsplash.com/photo-1511689660979-10d2b1aada49?q=80&w=800",
      { tags: ["vegetarian"], allergens: ["dairy", "gluten"], prepTimeMinutes: 14,
        recipe: [{ ingredient: ing["Pizza Dough Ball"], quantity: 1, unit: "pcs" }, { ingredient: ing.Tomatoes, quantity: 0.08, unit: "kg" }, { ingredient: ing.Mushrooms, quantity: 0.06, unit: "kg" }] }
    ),
    item(
      "Truffle Parmesan Fries", "truffle-parmesan-fries",
      "Crispy fries, truffle oil, parmesan, herbs.",
      12, "Sides", "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?q=80&w=800",
      { tags: ["vegetarian", "popular"], allergens: ["dairy"], prepTimeMinutes: 10,
        recipe: [{ ingredient: ing.Potatoes, quantity: 0.25, unit: "kg" }, { ingredient: ing["Truffle Oil"], quantity: 5, unit: "ml" }, { ingredient: ing.Parmesan, quantity: 0.02, unit: "kg" }] }
    ),
    item(
      "Garlic Mashed Potatoes", "garlic-mashed-potatoes",
      "Buttery mashed potatoes, roasted garlic.",
      9, "Sides", "https://images.unsplash.com/photo-1600335895229-6e75511892c8?q=80&w=800",
      { tags: ["vegetarian", "gluten-free"], allergens: ["dairy"], prepTimeMinutes: 12,
        recipe: [{ ingredient: ing.Potatoes, quantity: 0.3, unit: "kg" }, { ingredient: ing.Butter, quantity: 0.03, unit: "kg" }, { ingredient: ing.Garlic, quantity: 0.02, unit: "kg" }] }
    ),
    item(
      "Grilled Asparagus", "grilled-asparagus",
      "Char-grilled asparagus, lemon, sea salt.",
      11, "Sides", "https://images.unsplash.com/photo-1515471209610-3e64f2c4ee70?q=80&w=800",
      { tags: ["vegan", "gluten-free"], allergens: [], prepTimeMinutes: 9,
        recipe: [{ ingredient: ing.Asparagus, quantity: 0.2, unit: "kg" }, { ingredient: ing.Lemons, quantity: 1, unit: "pcs" }] }
    ),
    item(
      "Sautéed Wild Mushrooms", "sauteed-wild-mushrooms",
      "Garlic butter wild mushrooms, fresh thyme.",
      11, "Sides", "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800",
      { tags: ["vegetarian", "gluten-free"], allergens: ["dairy"], prepTimeMinutes: 10,
        recipe: [{ ingredient: ing.Mushrooms, quantity: 0.2, unit: "kg" }, { ingredient: ing.Butter, quantity: 0.03, unit: "kg" }] }
    ),
    item(
      "House Side Salad", "house-side-salad",
      "Mixed greens, shaved parmesan, house vinaigrette.",
      8, "Sides", "https://images.unsplash.com/photo-1551248429-40975aa4de74?q=80&w=800",
      { tags: ["vegetarian", "gluten-free"], allergens: ["dairy"], prepTimeMinutes: 6,
        recipe: [{ ingredient: ing["Mixed Greens"], quantity: 0.1, unit: "kg" }, { ingredient: ing.Parmesan, quantity: 0.02, unit: "kg" }] }
    ),
    item(
      "Burnt Honey Tart", "burnt-honey-tart",
      "Caramelized honey custard tart with a dark chocolate shell.",
      14, "Desserts", "https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=800",
      { tags: ["dessert"], allergens: ["egg", "dairy", "gluten"], prepTimeMinutes: 10,
        recipe: [{ ingredient: ing["Dark Chocolate"], quantity: 0.06, unit: "kg" }, { ingredient: ing.Eggs, quantity: 2, unit: "pcs" }, { ingredient: ing.Honey, quantity: 0.05, unit: "l" }] }
    ),
    item(
      "Tiramisu", "tiramisu",
      "Espresso-soaked ladyfingers, mascarpone, cocoa.",
      13, "Desserts", "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=800",
      { tags: ["dessert", "classic"], allergens: ["egg", "dairy", "gluten"], prepTimeMinutes: 8,
        recipe: [{ ingredient: ing.Mascarpone, quantity: 0.1, unit: "kg" }, { ingredient: ing["Espresso Beans"], quantity: 0.02, unit: "kg" }, { ingredient: ing.Eggs, quantity: 2, unit: "pcs" }] }
    ),
    item(
      "Molten Chocolate Cake", "molten-chocolate-cake",
      "Warm chocolate cake, molten center, vanilla ice cream.",
      15, "Desserts", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800",
      { tags: ["dessert", "popular"], allergens: ["egg", "dairy", "gluten"], prepTimeMinutes: 14, isFeatured: true,
        recipe: [{ ingredient: ing["Dark Chocolate"], quantity: 0.08, unit: "kg" }, { ingredient: ing["Vanilla Ice Cream"], quantity: 0.08, unit: "kg" }, { ingredient: ing.Eggs, quantity: 2, unit: "pcs" }] }
    ),
    item(
      "Strawberry Shortcake", "strawberry-shortcake",
      "Fresh strawberries, whipped cream, buttermilk biscuit.",
      12, "Desserts", "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800",
      { tags: ["dessert", "seasonal"], allergens: ["dairy", "gluten"], prepTimeMinutes: 9,
        recipe: [{ ingredient: ing.Strawberries, quantity: 0.15, unit: "kg" }, { ingredient: ing["Heavy Cream"], quantity: 0.05, unit: "l" }] }
    ),
    item(
      "House Red Wine (Glass)", "house-red-wine-glass",
      "Rotating regional red wine selection, by the glass.",
      11, "Beverages", "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800",
      { tags: ["wine", "alcohol"], allergens: [], prepTimeMinutes: 2,
        recipe: [{ ingredient: ing["House Red Wine"], quantity: 0.15, unit: "l" }] }
    ),
    item(
      "Fresh Orange Juice", "fresh-orange-juice",
      "Cold-pressed orange juice.",
      6, "Beverages", "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=800",
      { tags: ["non-alcoholic"], allergens: [], prepTimeMinutes: 3,
        recipe: [{ ingredient: ing["Orange Juice"], quantity: 0.25, unit: "l" }] }
    ),
  ];

  await menuItemsCol.insertMany(menuItemDefs);
  console.log(`Created ${menuItemDefs.length} menu items across ${categoryDefs.length} categories`);

  // --- Tables ---
  const tablesCol = db.collection("tables");
  await tablesCol.insertMany([
    { label: "T1", capacity: 2, location: "main", status: "available", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { label: "T2", capacity: 2, location: "main", status: "available", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { label: "T3", capacity: 4, location: "main", status: "available", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { label: "T4", capacity: 4, location: "main", status: "available", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { label: "T5", capacity: 4, location: "main", status: "available", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { label: "T6", capacity: 6, location: "main", status: "available", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { label: "Bar 1", capacity: 2, location: "bar", status: "available", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { label: "Bar 2", capacity: 2, location: "bar", status: "available", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { label: "Patio 1", capacity: 4, location: "patio", status: "available", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { label: "Patio 2", capacity: 4, location: "patio", status: "available", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { label: "Patio 3", capacity: 2, location: "patio", status: "available", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { label: "Private 1", capacity: 8, location: "private", status: "available", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { label: "Private 2", capacity: 12, location: "private", status: "available", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ]);
  console.log("Created 13 tables");

  // --- Coupons ---
  const couponsCol = db.collection("coupons");
  await couponsCol.insertMany([
    {
      code: "WELCOME10",
      description: "10% off your first order",
      type: "percent",
      value: 10,
      minOrderAmount: 0,
      maxUses: null,
      usedCount: 0,
      maxUsesPerUser: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      code: "SAVE5",
      description: "$5 off orders over $40",
      type: "fixed",
      value: 5,
      minOrderAmount: 40,
      maxUses: 200,
      usedCount: 0,
      maxUsesPerUser: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      code: "FORK20",
      description: "20% off orders over $100",
      type: "percent",
      value: 20,
      minOrderAmount: 100,
      maxUses: 100,
      usedCount: 0,
      maxUsesPerUser: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      code: "FREESHIP",
      description: "$4.99 off delivery fee",
      type: "fixed",
      value: 4.99,
      minOrderAmount: 0,
      maxUses: null,
      usedCount: 0,
      maxUsesPerUser: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      code: "VIP15",
      description: "15% off for loyalty members",
      type: "percent",
      value: 15,
      minOrderAmount: 25,
      maxUses: null,
      usedCount: 0,
      maxUsesPerUser: 5,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("Created 5 coupons");

  console.log("\nSeed complete!");
  console.log("Login as admin@goldenfork.com / password123");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
