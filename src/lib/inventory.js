import { Ingredient, InventoryLog, MenuItem } from "@/models";
import { notifyAdmins } from "@/lib/notifications/dispatch";

/**
 * Deducts ingredient stock for each item in an order based on MenuItem.recipe,
 * logs the usage, and fires a low-stock alert if any ingredient crosses
 * its threshold as a result.
 */
export async function deductInventoryForOrder(order) {
  const menuItemIds = order.items.map((i) => i.menuItem);
  const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } })
    .select("recipe name")
    .lean();
  const menuItemMap = new Map(menuItems.map((m) => [String(m._id), m]));

  const lowStockHits = [];

  for (const orderItem of order.items) {
    const menuItem = menuItemMap.get(String(orderItem.menuItem));
    if (!menuItem?.recipe?.length) continue;

    for (const ri of menuItem.recipe) {
      const usedQty = ri.quantity * orderItem.quantity;

      const ingredient = await Ingredient.findByIdAndUpdate(
        ri.ingredient,
        { $inc: { currentStock: -usedQty } },
        { new: true }
      );
      if (!ingredient) continue;

      await InventoryLog.create({
        ingredient: ingredient._id,
        type: "usage",
        quantity: -usedQty,
        relatedOrder: order._id,
        note: `Used for ${orderItem.quantity}x ${menuItem.name}`,
      });

      if (ingredient.currentStock <= ingredient.lowStockThreshold) {
        lowStockHits.push(ingredient);
      }
    }
  }

  for (const ingredient of lowStockHits) {
    await notifyAdmins({
      type: "low-stock",
      title: "Low stock alert",
      message: `${ingredient.name} is down to ${ingredient.currentStock}${ingredient.unit} (threshold: ${ingredient.lowStockThreshold}${ingredient.unit}).`,
    });
  }

  return { lowStockHits };
}
