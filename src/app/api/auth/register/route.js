import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth/password";
import { signToken, AUTH_COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth/jwt";
import { registerSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { cookies } from "next/headers";
import { awardReferralBonus } from "@/lib/loyalty";

export const POST = withErrorHandling(async (req) => {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid input", 422);
  }
  const { name, email, phone, password, referralCode } = parsed.data;

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    return fail("An account with this email already exists.", 409);
  }

  let referredBy = null;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode });
    if (referrer) referredBy = referrer._id;
  }

  const passwordHash = await hashPassword(password);
  const newReferralCode = `${name.split(" ")[0].toUpperCase().slice(0, 5)}${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  const user = await User.create({
    name,
    email,
    phone,
    passwordHash,
    role: "customer",
    referralCode: newReferralCode,
    referredBy,
  });

  if (referredBy) {
    await awardReferralBonus(user);
  }

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
      referralCode: user.referralCode,
    },
  });
});
