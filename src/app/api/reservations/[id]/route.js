import { connectDB } from "@/lib/db/connect";
import { Reservation, Table } from "@/models";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole, STAFF_ROLES } from "@/lib/auth/session";
import { notify } from "@/lib/notifications/dispatch";

const VALID_STATUSES = ["pending", "confirmed", "seated", "completed", "cancelled", "no-show"];

const MESSAGE = {
  confirmed: "Your reservation is confirmed. We'll see you then!",
  seated: "You've been seated. Enjoy your meal!",
  completed: "Thanks for dining with us!",
  cancelled: "Your reservation has been cancelled.",
  "no-show": "We missed you for your reservation.",
};

export const PATCH = withErrorHandling(async (req, { params }) => {
  await requireRole(STAFF_ROLES);
  await connectDB();
  const { id } = await params;
  const body = await req.json();

  const reservation = await Reservation.findById(id);
  if (!reservation) return fail("Reservation not found", 404);

  if (body.status) {
    if (!VALID_STATUSES.includes(body.status)) return fail("Invalid status", 422);
    reservation.status = body.status;
  }
  if (body.table) {
    reservation.table = body.table;
    if (body.status === "seated") {
      await Table.findByIdAndUpdate(body.table, { status: "occupied" });
    }
  }

  await reservation.save();

  if (body.status && MESSAGE[body.status]) {
    await notify({
      recipientId: reservation.customer,
      type: "reservation",
      title: "Reservation update",
      message: MESSAGE[body.status],
      email: reservation.guestInfo?.email,
      phone: reservation.guestInfo?.phone,
      forceEmail: true,
    });
  }

  return ok({ reservation });
});
