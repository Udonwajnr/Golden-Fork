import { getCurrentUser } from "@/lib/auth/session";
import { ok, withErrorHandling } from "@/lib/api-response";

export const GET = withErrorHandling(async () => {
  const user = await getCurrentUser();
  return ok({ user });
});
