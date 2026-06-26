import { connectDB } from "@/lib/db/connect";
import { Table } from "@/models";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole, STAFF_ROLES } from "@/lib/auth/session";

export const PATCH = withErrorHandling(async (req, { params }) => {
  await requireRole(STAFF_ROLES);
  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const table = await Table.findByIdAndUpdate(id, body, { new: true });
  if (!table) return fail("Table not found", 404);
  return ok({ table });
});

export const DELETE = withErrorHandling(async (_req, { params }) => {
  await requireRole(STAFF_ROLES);
  await connectDB();
  const { id } = await params;
  await Table.findByIdAndUpdate(id, { isActive: false });
  return ok({ message: "Table removed" });
});
