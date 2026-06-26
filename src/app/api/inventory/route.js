import { connectDB } from "@/lib/db/connect";
import { Ingredient, InventoryLog } from "@/models";
import { ingredientSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES } from "@/lib/auth/session";

export const GET = withErrorHandling(async (req) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();

  const { searchParams } = new URL(req.url);
  const lowStockOnly = searchParams.get("lowStock") === "true";

  const filter = { isActive: true };
  if (lowStockOnly) {
    filter.$expr = { $lte: ["$currentStock", "$lowStockThreshold"] };
  }

  const ingredients = await Ingredient.find(filter)
    .populate("supplier", "name")
    .sort({ name: 1 })
    .lean();

  return ok({ ingredients });
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireRole(MANAGEMENT_ROLES);
  await connectDB();

  const body = await req.json();
  const parsed = ingredientSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid input", 422);
  }

  const ingredient = await Ingredient.create({
    ...parsed.data,
    supplier: parsed.data.supplier || undefined,
    lastRestockedAt: new Date(),
  });

  if (ingredient.currentStock > 0) {
    await InventoryLog.create({
      ingredient: ingredient._id,
      type: "restock",
      quantity: ingredient.currentStock,
      note: "Initial stock",
      performedBy: user._id,
    });
  }

  return ok({ ingredient }, { status: 201 });
});
