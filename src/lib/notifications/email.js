import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email:stub] to=${to} subject="${subject}"`);
    return { stubbed: true };
  }
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || '"The Golden Fork" <no-reply@thegoldenfork.com>',
      to,
      subject,
      html,
      text,
    });
    return { sent: true };
  } catch (err) {
    console.error("[email] send failed", err);
    return { sent: false, error: err.message };
  }
}
