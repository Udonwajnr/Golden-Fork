"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Award, History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth/auth-context";
import { toast } from "sonner";

const TIER_NEXT = {
  bronze: { next: "Silver", at: 1000 },
  silver: { next: "Gold", at: 4000 },
  gold: { next: "Platinum", at: 10000 },
  platinum: { next: null, at: null },
};

export default function AccountPage() {
  const { user, isLoading, refresh } = useAuth();
  const router = useRouter();
  const [prefs, setPrefs] = useState({ notifyByEmail: true, notifyBySms: false });

  useEffect(() => {
    if (!isLoading && !user) router.push("/login?redirect=/account");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) setPrefs({ notifyByEmail: user.notifyByEmail, notifyBySms: user.notifyBySms });
  }, [user]);

  async function updatePrefs(next) {
    setPrefs(next);
    await fetch("/api/auth/me/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    }).catch(() => {});
  }

  function copyReferral() {
    navigator.clipboard.writeText(user.referralCode);
    toast.success("Referral code copied");
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-gf-gold" />
      </div>
    );
  }

  const tierInfo = TIER_NEXT[user.loyaltyTier];
  const progressPct = tierInfo?.at
    ? Math.min(100, (user.loyaltyPoints / tierInfo.at) * 100)
    : 100;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl text-gf-cream">My Account</h1>
      <p className="mt-1 text-gf-muted">{user.name} · {user.email}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gf-gold">
              <Award className="size-4" /> Loyalty Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="gold" className="capitalize">{user.loyaltyTier}</Badge>
              <span className="font-display text-2xl text-gf-cream">{user.loyaltyPoints} pts</span>
            </div>
            {tierInfo?.next && (
              <>
                <Progress value={progressPct} className="mt-4" />
                <p className="mt-2 text-xs text-gf-muted">
                  {tierInfo.at - user.loyaltyPoints > 0
                    ? `${tierInfo.at - user.loyaltyPoints} points to ${tierInfo.next}`
                    : `You've unlocked ${tierInfo.next}!`}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gf-gold">Refer a Friend</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gf-muted">
              Share your code — you both earn bonus points when they order.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-md border border-gf-border bg-gf-bg-elevated px-3 py-2">
              <code className="flex-1 text-gf-gold">{user.referralCode}</code>
              <button onClick={copyReferral} aria-label="Copy referral code">
                <Copy className="size-4 text-gf-muted hover:text-gf-gold" />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gf-gold">
              <History className="size-4" /> Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-gf-muted">View your full order history and track current orders.</p>
            <Button variant="outline" asChild>
              <Link href="/account/orders">View Orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="text-gf-gold">Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notif">Email updates on order status</Label>
              <Switch
                id="email-notif"
                checked={prefs.notifyByEmail}
                onCheckedChange={(v) => updatePrefs({ ...prefs, notifyByEmail: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notif">SMS updates on order status</Label>
              <Switch
                id="sms-notif"
                checked={prefs.notifyBySms}
                onCheckedChange={(v) => updatePrefs({ ...prefs, notifyBySms: v })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
