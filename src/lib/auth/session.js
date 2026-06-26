import { cookies } from "next/headers";
import { verifyToken, AUTH_COOKIE_NAME } from "./jwt";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";

/**
 * Reads the JWT cookie and returns the decoded payload, or null.
 * Use in server components / route handlers that only need id+role+email
 * (no DB hit).
 */
export async function getSessionPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Returns the full current user document (sans passwordHash), or null.
 */
export async function getCurrentUser() {
  const payload = await getSessionPayload();
  if (!payload?.sub) return null;

  await connectDB();
  const user = await User.findById(payload.sub).select("-passwordHash").lean();
  if (!user || !user.isActive) return null;
  return user;
}

/**
 * Throws a Response-friendly error object if the current user doesn't
 * have one of the allowed roles. Returns the user otherwise.
 */
export async function requireRole(allowedRoles = []) {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
  return user;
}

export const STAFF_ROLES = ["waiter", "kitchen", "manager", "admin"];
export const MANAGEMENT_ROLES = ["manager", "admin"];
