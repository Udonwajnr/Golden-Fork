import { connectDB } from "@/lib/db/connect";
import { MenuCategory } from "@/models";
import { categorySchema } from "@/lib/validation";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";

export const GET = withErrorHandling(async () => {
  await connectDB();
  const categories = await MenuCategory.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  return ok({ categories });
});

export const POST = withErrorHandling(async (req) => {
  await requireRole(["manager", "admin"]);
  await connectDB();

  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid input", 422);
  }

  let slug = slugify(parsed.data.name);
  const existing = await MenuCategory.findOne({ slug });
  if (existing) return fail("A category with this name already exists.", 409);

  const category = await MenuCategory.create({ ...parsed.data, slug });
  return ok({ category }, { status: 201 });
});
