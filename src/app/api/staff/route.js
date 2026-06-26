import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth/password";
import { staffSchema } from "@/lib/validation";
import { ok, fail, withErrorHandling } from "@/lib/api-response";
import { requireRole, MANAGEMENT_ROLES, STAFF_ROLES } from "@/lib/auth/session";

export const GET = withErrorHandling(async () => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();
  const staff = await User.find({ role: { $in: STAFF_ROLES } })
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .lean();
  return ok({ staff });
});

export const POST = withErrorHandling(async (req) => {
  await requireRole(MANAGEMENT_ROLES);
  await connectDB();

  const body = await req.json();
  const parsed = staffSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid input", 422);
  }

  const existing = await User.findOne({ email: parsed.data.email });
  if (existing) return fail("An account with this email already exists.", 409);

  const passwordHash = await hashPassword(parsed.data.password);
  const staffMember = await User.create({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    passwordHash,
    role: parsed.data.role,
  });

  const { passwordHash: _omit, ...safe } = staffMember.toObject();
  return ok({ staff: safe }, { status: 201 });
});
