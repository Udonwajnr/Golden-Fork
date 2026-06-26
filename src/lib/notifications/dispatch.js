import { Notification, User } from "@/models";
import { sendEmail } from "./email";
import { sendSms } from "./sms";

/**
 * notify({
 *   recipientId, audience: 'customer'|'admin'|'staff', type, title, message,
 *   relatedOrder, email, phone, forceEmail, forceSms
 * })
 *
 * Always writes an in-app Notification row. Sends email/sms based on the
 * recipient's notifyByEmail/notifyBySms prefs (or `force*` overrides for
 * transactional messages that should always go out, e.g. order confirmations).
 */
export async function notify({
  recipientId = null,
  audience = "customer",
  type,
  title,
  message,
  relatedOrder = null,
  email = null,
  phone = null,
  forceEmail = false,
  forceSms = false,
}) {
  let recipient = null;
  if (recipientId) {
    recipient = await User.findById(recipientId).lean();
  }

  await Notification.create({
    recipient: recipientId,
    channel: "in-app",
    audience,
    type,
    title,
    message,
    relatedOrder,
  });

  const targetEmail = email || recipient?.email;
  const targetPhone = phone || recipient?.phone;
  const wantsEmail = forceEmail || recipient?.notifyByEmail !== false;
  const wantsSms = forceSms || recipient?.notifyBySms === true;

  if (targetEmail && wantsEmail) {
    await sendEmail({
      to: targetEmail,
      subject: title,
      html: `<p>${message}</p>`,
      text: message,
    });
  }

  if (targetPhone && wantsSms) {
    await sendSms({ to: targetPhone, body: `${title}: ${message}` });
  }
}

export async function notifyAdmins({ type, title, message, relatedOrder = null }) {
  const admins = await User.find({
    role: { $in: ["manager", "admin"] },
    isActive: true,
  }).lean();

  await Notification.create({
    audience: "admin",
    channel: "in-app",
    type,
    title,
    message,
    relatedOrder,
  });

  // Email the admins/managers directly (alerts should always go out)
  for (const admin of admins) {
    if (admin.email) {
      await sendEmail({
        to: admin.email,
        subject: `[Golden Fork Admin] ${title}`,
        html: `<p>${message}</p>`,
        text: message,
      });
    }
  }
}
