import { connectDB } from "@/lib/db/connect";
import { Ingredient } from "@/models";
import { ingredientSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES } from "@/lib/auth/session";

export const PATCH = withErrorHandling(async (req, { params }) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const parsed = ingredientSchema.partial().safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid input", 422);
  }
  const ingredient = await Ingredient.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!ingredient) return fail("Ingredient not found", 404);
  return ok({ ingredient });
});

export const DELETE = withErrorHandling(async (_req, { params }) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const { id } = await params;
  await Ingredient.findByIdAndUpdate(id, { isActive: false });
  return ok({ message: "Ingredient removed" });
});
