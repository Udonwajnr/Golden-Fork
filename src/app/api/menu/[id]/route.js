import { connectDB } from "@/lib/db/connect";
import { MenuItem } from "@/models";
import { menuItemSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";

export const GET = withErrorHandling(async (_req, { params }) => {
  await connectDB();
  const { id } = await params;
  const item = await MenuItem.findById(id)
    .populate("category", "name slug")
    .populate("recipe.ingredient", "name unit currentStock");
  if (!item) return fail("Menu item not found", 404);
  return ok({ item });
});

export const PATCH = withErrorHandling(async (req, { params }) => {
  await requireRole(["manager", "admin"]);
  await connectDB();
  const { id } = await params;
  const body = await req.json();

  // partial update - allow toggling availability without full schema
  if (Object.keys(body).length === 1 && "isAvailable" in body) {
    const item = await MenuItem.findByIdAndUpdate(
      id,
      { isAvailable: body.isAvailable },
      { new: true }
    );
    if (!item) return fail("Menu item not found", 404);
    return ok({ item });
  }

  const parsed = menuItemSchema.partial().safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid input", 422);
  }

  const item = await MenuItem.findByIdAndUpdate(
    id,
    { ...parsed.data, recipe: body.recipe },
    { new: true }
  );
  if (!item) return fail("Menu item not found", 404);
  return ok({ item });
});

export const DELETE = withErrorHandling(async (_req, { params }) => {
  await requireRole(["manager", "admin"]);
  await connectDB();
  const { id } = await params;
  const item = await MenuItem.findByIdAndDelete(id);
  if (!item) return fail("Menu item not found", 404);
  return ok({ message: "Menu item deleted" });
});
