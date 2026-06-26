import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES, STAFF_ROLES } from "@/lib/auth/session";

export const PATCH = withErrorHandling(async (req, { params }) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const { id } = await params;
  const body = await req.json();

  const updates = {};
  if (body.role && STAFF_ROLES.includes(body.role)) updates.role = body.role;
  if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
  if (body.name) updates.name = body.name;
  if (body.phone) updates.phone = body.phone;

  const staff = await User.findByIdAndUpdate(id, updates, { new: true }).select(
    "-passwordHash"
  );
  if (!staff) return fail("Staff member not found", 404);
  return ok({ staff });
});

export const DELETE = withErrorHandling(async (_req, { params }) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const { id } = await params;
  await User.findByIdAndUpdate(id, { isActive: false });
  return ok({ message: "Staff member deactivated" });
});
