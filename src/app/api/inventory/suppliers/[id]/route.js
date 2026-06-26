import { connectDB } from "@/lib/db/connect";
import { Supplier } from "@/models";
import { supplierSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES } from "@/lib/auth/session";

export const PATCH = withErrorHandling(async (req, { params }) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const parsed = supplierSchema.partial().safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid input", 422);
  }
  const supplier = await Supplier.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!supplier) return fail("Supplier not found", 404);
  return ok({ supplier });
});

export const DELETE = withErrorHandling(async (_req, { params }) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const { id } = await params;
  await Supplier.findByIdAndUpdate(id, { isActive: false });
  return ok({ message: "Supplier removed" });
});
