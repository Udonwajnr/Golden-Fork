import { connectDB } from "@/lib/db/connect";
import { MenuCategory, MenuItem } from "@/models";
import { categorySchema } from "@/lib/validation";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";

export const PATCH = withErrorHandling(async (req, { params }) => {
  await requireRole(["manager", "admin"]);
  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const parsed = categorySchema.partial().safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid input", 422);
  }
  const category = await MenuCategory.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!category) return fail("Category not found", 404);
  return ok({ category });
});

export const DELETE = withErrorHandling(async (_req, { params }) => {
  await requireRole(["manager", "admin"]);
  await connectDB();
  const { id } = await params;

  const itemCount = await MenuItem.countDocuments({ category: id });
  if (itemCount > 0) {
    return fail(
      `Can't delete: ${itemCount} menu item(s) still use this category.`,
      409
    );
  }

  const category = await MenuCategory.findByIdAndDelete(id);
  if (!category) return fail("Category not found", 404);
  return ok({ message: "Category deleted" });
});
