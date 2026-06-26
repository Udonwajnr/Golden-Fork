import { connectDB } from "@/lib/db/connect";
import { InventoryLog } from "@/models";
import { ok, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES } from "@/lib/auth/session";

export const GET = withErrorHandling(async (_req, { params }) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const { id } = await params;

  const logs = await InventoryLog.find({ ingredient: id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("performedBy", "name")
    .lean();

  return ok({ logs });
});
