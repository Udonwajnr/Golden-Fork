import { connectDB } from "@/lib/db/connect";
import { Reservation } from "@/models";
import { reservationSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { getCurrentUser, STAFF_ROLES } from "@/lib/auth/session";
import { notify, notifyAdmins } from "@/lib/notifications/dispatch";

export const POST = withErrorHandling(async (req) => {
  await connectDB();
  const user = await getCurrentUser();

  const body = await req.json();
  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid reservation", 422);
  }
  const data = parsed.data;

  const reservation = await Reservation.create({
    customer: user?._id,
    guestInfo: data.guestInfo,
    partySize: data.partySize,
    date: new Date(data.date),
    specialRequests: data.specialRequests,
    occasion: data.occasion || "none",
    status: "pending",
  });

  await notify({
    recipientId: user?._id,
    type: "reservation",
    title: "Reservation request received",
    message: `We received your reservation request for ${data.partySize} guest(s) on ${new Date(
      data.date
    ).toLocaleString()}. We'll confirm shortly.`,
    email: data.guestInfo.email,
    phone: data.guestInfo.phone,
    forceEmail: true,
  });

  await notifyAdmins({
    type: "reservation",
    title: "New reservation request",
    message: `${data.guestInfo.name} requested a table for ${data.partySize} on ${new Date(
      data.date
    ).toLocaleString()}.`,
  });

  return ok({ reservation }, { status: 201 });
});

export const GET = withErrorHandling(async (req) => {
  const user = await getCurrentUser();
  await connectDB();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const filter = {};
  if (status) filter.status = status;

  if (user && STAFF_ROLES.includes(user.role)) {
    // staff sees all
  } else if (user) {
    filter.customer = user._id;
  } else {
    return fail("Sign in to view reservations.", 401);
  }

  const reservations = await Reservation.find(filter)
    .sort({ date: 1 })
    .populate("table", "label capacity")
    .lean();

  return ok({ reservations });
});
