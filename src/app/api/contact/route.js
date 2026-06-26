import { connectDB } from "@/lib/db/connect";
import { ContactMessage } from "@/models";
import { contactMessageSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { getCurrentUser, requireRole, MANAGEMENT_ROLES } from "@/lib/auth/session";
import { notifyAdmins } from "@/lib/notifications/dispatch";

export const POST = withErrorHandling(async (req) => {
  await connectDB();
  const user = await getCurrentUser();

  const body = await req.json();
  const parsed = contactMessageSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid input", 422);
  }

  const contactMessage = await ContactMessage.create({
    ...parsed.data,
    user: user?._id,
    status: "new",
  });

  await notifyAdmins({
    type: "contact",
    title: "New contact message",
    message: `${parsed.data.name} (${parsed.data.email}) sent a message: "${parsed.data.message.slice(0, 140)}${parsed.data.message.length > 140 ? "…" : ""}"`,
  });

  return ok(
    {
      message: "Your message has been sent. We'll get back to you soon.",
      contactMessage: { _id: contactMessage._id },
    },
    { status: 201 }
  );
});

export const GET = withErrorHandling(async (req) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const filter = {};
  if (status && status !== "all") filter.status = status;

  const messages = await ContactMessage.find(filter).sort({ createdAt: -1 }).lean();
  const unreadCount = await ContactMessage.countDocuments({ status: "new" });

  return ok({ messages, unreadCount });
});