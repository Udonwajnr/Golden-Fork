import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { comparePassword } from "@/lib/auth/password";
import { signToken, AUTH_COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth/jwt";
import { loginSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { cookies } from "next/headers";

export const POST = withErrorHandling(async (req) => {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid input", 422);
  }
  const { email, password } = parsed.data;

  await connectDB();
  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    return fail("Invalid email or password.", 401);
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return fail("Invalid email or password.", 401);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({ sub: user._id.toString(), role: user.role });
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);

  return ok({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
      loyaltyTier: user.loyaltyTier,
    },
  });
});
