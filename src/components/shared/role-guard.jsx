"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

export function RoleGuard({ allowedRoles, children, redirectTo = "/login" }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push(`${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.push("/");
    }
  }, [user, isLoading, allowedRoles, redirectTo, router]);

  if (isLoading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gf-bg">
        <Loader2 className="size-6 animate-spin text-gf-gold" />
      </div>
    );
  }

  return children;
}
