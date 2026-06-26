import { connectDB } from "@/lib/db/connect";
import { Order, MenuItem, MenuCategory } from "@/models";

/**
 * Tool schemas passed to Claude's `tools` param, plus the matching
 * handler functions. Kept together so the schema and implementation
 * never drift apart.
 */

export const CHAT_TOOLS = [
  {
    name: "lookup_order_status",
    description:
      "Look up the current status of a customer's order using their order number (format like GF-XXXXX-XXX). Use this whenever the customer asks about an order they've already placed, e.g. 'where is my order', 'is my order ready', 'what's the status of GF-ABC123-XYZ'. If the customer hasn't given an order number, ask them for it instead of calling this tool.",
    input_schema: {
      type: "object",
      properties: {
        orderNumber: {
          type: "string",
          description: "The order number, e.g. GF-M1A2B3-C4D",
        },
      },
      required: ["orderNumber"],
    },
  },
  {
    name: "search_menu",
    description:
      "Search the restaurant's current menu by keyword (dish name, ingredient, or tag like 'vegan', 'spicy', 'gluten-free'). Use this to answer questions about what's on the menu, prices, ingredients, allergens, or to recommend dishes. Always prefer this over guessing menu contents from general knowledge.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Keyword to search for, e.g. 'salmon', 'vegan', 'pasta'",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "list_categories",
    description:
      "List all current menu categories (e.g. Starters, Mains, Desserts). Use this when the customer asks broadly what kind of food is offered, before drilling into search_menu.",
    input_schema: { type: "object", properties: {} },
  },
];

export async function runTool(name, input, { currentUser } = {}) {
  await connectDB();

  if (name === "lookup_order_status") {
    const orderNumber = String(input.orderNumber || "").trim().toUpperCase();
    if (!orderNumber) return { error: "No order number provided." };

    const order = await Order.findOne({ orderNumber })
      .select("orderNumber status items type total createdAt estimatedReadyAt customer guestInfo.email")
      .lean();

    if (!order) {
      return { found: false, message: "No order found with that order number." };
    }

    // Light privacy guard: if the chat session belongs to a logged-in
    // customer, only let them look up their own orders this way.
    if (currentUser && order.customer && String(order.customer) !== String(currentUser._id)) {
      return {
        found: false,
        message: "That order doesn't appear to belong to your account. Please double check the order number.",
      };
    }

    return {
      found: true,
      orderNumber: order.orderNumber,
      status: order.status,
      type: order.type,
      total: order.total,
      itemCount: order.items.length,
      placedAt: order.createdAt,
      estimatedReadyAt: order.estimatedReadyAt || null,
    };
  }

  if (name === "search_menu") {
    const query = String(input.query || "").trim();
    if (!query) return { results: [] };

    const items = await MenuItem.find({
      isAvailable: true,
      $text: { $search: query },
    })
      .select("name description price tags allergens category")
      .populate("category", "name")
      .limit(8)
      .lean();

    // Text index search can miss partial/loose matches; fall back to regex.
    let finalItems = items;
    if (finalItems.length === 0) {
      finalItems = await MenuItem.find({
        isAvailable: true,
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
      })
        .select("name description price tags allergens category")
        .populate("category", "name")
        .limit(8)
        .lean();
    }

    return {
      results: finalItems.map((i) => ({
        name: i.name,
        description: i.description,
        price: i.price,
        category: i.category?.name,
        tags: i.tags,
        allergens: i.allergens,
      })),
    };
  }

  if (name === "list_categories") {
    const categories = await MenuCategory.find({ isActive: true })
      .select("name description")
      .sort({ sortOrder: 1 })
      .lean();
    return { categories: categories.map((c) => ({ name: c.name, description: c.description })) };
  }

  return { error: `Unknown tool: ${name}` };
}