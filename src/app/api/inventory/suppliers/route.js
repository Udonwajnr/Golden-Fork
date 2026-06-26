import { connectDB } from "@/lib/db/connect";
import { Supplier } from "@/models";
import { supplierSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES } from "@/lib/auth/session";

export const GET = withErrorHandling(async () => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const suppliers = await Supplier.find({ isActive: true }).sort({ name: 1 }).lean();
  return ok({ suppliers });
});

export const POST = withErrorHandling(async (req) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const body = await req.json();
  const parsed = supplierSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid input", 422);
  }
  const supplier = await Supplier.create(parsed.data);
  return ok({ supplier }, { status: 201 });
});
