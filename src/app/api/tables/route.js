import { connectDB } from "@/lib/db/connect";
import { Table } from "@/models";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES } from "@/lib/auth/session";

export const GET = withErrorHandling(async (req) => {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const filter = { isActive: true };
  if (status) filter.status = status;

  const tables = await Table.find(filter).sort({ label: 1 }).lean();
  return ok({ tables });
});

export const POST = withErrorHandling(async (req) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const body = await req.json();
  if (!body.label || !body.capacity) {
    return fail("Table label and capacity are required.", 422);
  }
  const table = await Table.create({
    label: body.label,
    capacity: body.capacity,
    location: body.location || "main",
  });
  return ok({ table }, { status: 201 });
});
