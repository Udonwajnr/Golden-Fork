import { connectDB } from "@/lib/db/connect";
import { Notification } from "@/models";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { getCurrentUser, STAFF_ROLES } from "@/lib/auth/session";

export const GET = withErrorHandling(async (req) => {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthorized", 401);
  await connectDB();

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 30, 100);

  const filter = STAFF_ROLES.includes(user.role)
    ? { $or: [{ audience: "admin" }, { recipient: user._id }] }
    : { recipient: user._id };

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });

  return ok({ notifications, unreadCount });
});

export const PATCH = withErrorHandling(async (req) => {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthorized", 401);
  await connectDB();

  const { ids, markAllRead } = await req.json();

  if (markAllRead) {
    const filter = STAFF_ROLES.includes(user.role)
      ? { $or: [{ audience: "admin" }, { recipient: user._id }] }
      : { recipient: user._id };
    await Notification.updateMany(filter, { isRead: true });
  } else if (Array.isArray(ids) && ids.length) {
    await Notification.updateMany({ _id: { $in: ids } }, { isRead: true });
  }

  return ok({ message: "Notifications updated" });
});
