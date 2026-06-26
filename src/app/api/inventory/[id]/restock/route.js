import { connectDB } from "@/lib/db/connect";
import { Ingredient, InventoryLog } from "@/models";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES } from "@/lib/auth/session";

export const POST = withErrorHandling(async (req, { params }) => {
  const user = await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const { id } = await params;
  const { quantity, note } = await req.json();

  if (!quantity || quantity <= 0) {
    return fail("Restock quantity must be greater than 0.", 422);
  }

  const ingredient = await Ingredient.findByIdAndUpdate(
    id,
    { $inc: { currentStock: quantity }, lastRestockedAt: new Date() },
    { new: true }
  );
  if (!ingredient) return fail("Ingredient not found", 404);

  await InventoryLog.create({
    ingredient: ingredient._id,
    type: "restock",
    quantity,
    note: note || "Manual restock",
    performedBy: user._id,
  });

  return ok({ ingredient });
});
