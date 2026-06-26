"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Could not sign in");
        return;
      }
      await refresh();
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}`);

      const redirectTo = searchParams.get("redirect");
      if (redirectTo) {
        router.push(redirectTo);
      } else if (["waiter"].includes(data.user.role)) {
        router.push("/waiter");
      } else if (data.user.role === "kitchen") {
        router.push("/kitchen");
      } else if (["manager", "admin"].includes(data.user.role)) {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="text-center">
        <span className="tine-divider mx-auto mb-4 flex w-fit" aria-hidden="true">
          <span /><span /><span /><span /><span />
        </span>
        <h1 className="font-display text-3xl text-gf-cream">Welcome Back</h1>
        <p className="mt-2 text-sm text-gf-muted">Sign in to order, track, and earn rewards.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <Button type="submit" variant="gold" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gf-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-gf-gold hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
