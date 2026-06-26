import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth/jwt";
import { ok, withErrorHandling } from "@/lib/api-response";

export const POST = withErrorHandling(async () => {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  return ok({ message: "Logged out" });
});
