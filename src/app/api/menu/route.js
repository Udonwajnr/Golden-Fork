import { connectDB } from "@/lib/db/connect";
import { MenuItem, MenuCategory } from "@/models";
import { menuItemSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";

export const GET = withErrorHandling(async (req) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const includeUnavailable = searchParams.get("includeUnavailable") === "true";

  const filter = {};
  if (!includeUnavailable) filter.isAvailable = true;
  if (category && category !== "all") filter.category = category;
  if (q) filter.$text = { $search: q };

  const items = await MenuItem.find(filter)
    .populate("category", "name slug")
    .sort(q ? { score: { $meta: "textScore" } } : { sortOrder: 1, name: 1 })
    .lean();

  return ok({ items });
});

export const POST = withErrorHandling(async (req) => {
  await requireRole(["manager", "admin"]);
  await connectDB();

  const body = await req.json();
  const parsed = menuItemSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid input", 422);
  }

  const category = await MenuCategory.findById(parsed.data.category);
  if (!category) return fail("Category not found", 404);

  let slug = slugify(parsed.data.name);
  const existing = await MenuItem.findOne({ slug });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const item = await MenuItem.create({ ...parsed.data, slug, recipe: body.recipe || [] });
  return ok({ item }, { status: 201 });
});
