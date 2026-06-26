import { connectDB } from "@/lib/db/connect";
import { ContactMessage } from "@/models";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES } from "@/lib/auth/session";

const VALID_STATUSES = ["new", "read", "replied", "archived"];

export const PATCH = withErrorHandling(async (req, { params }) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const { id } = await params;
  const body = await req.json();

  const updates = {};
  if (body.status) {
    if (!VALID_STATUSES.includes(body.status)) return fail("Invalid status", 422);
    updates.status = body.status;
  }
  if (typeof body.adminNote === "string") updates.adminNote = body.adminNote;

  const contactMessage = await ContactMessage.findByIdAndUpdate(id, updates, { new: true });
  if (!contactMessage) return fail("Message not found", 404);
  return ok({ contactMessage });
});

export const DELETE = withErrorHandling(async (_req, { params }) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const { id } = await params;
  await ContactMessage.findByIdAndDelete(id);
  return ok({ message: "Message deleted" });
});