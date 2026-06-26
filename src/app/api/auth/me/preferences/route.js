import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { getSessionPayload } from "@/lib/auth/session";
import { ok, fail, withErrorHandling } from "@/lib/api-response";

export const PATCH = withErrorHandling(async (req) => {
  const payload = await getSessionPayload();
  if (!payload?.sub) return fail("Unauthorized", 401);

  await connectDB();
  const body = await req.json();
  const updates = {};
  if (typeof body.notifyByEmail === "boolean") updates.notifyByEmail = body.notifyByEmail;
  if (typeof body.notifyBySms === "boolean") updates.notifyBySms = body.notifyBySms;

  const user = await User.findByIdAndUpdate(payload.sub, updates, { new: true }).select(
    "-passwordHash"
  );
  return ok({ user });
});
