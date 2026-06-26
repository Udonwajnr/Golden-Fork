"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, Gift, Award } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { StatCard } from "@/components/admin/stat-card";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const EMPTY_COUPON = {
  code: "",
  description: "",
  type: "percent",
  value: "",
  minOrderAmount: "",
  maxUses: "",
  maxUsesPerUser: 1,
  expiresAt: "",
};

export default function AdminLoyaltyPage() {
  const [members, setMembers] = useState([]);
  const [tierCounts, setTierCounts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_COUPON);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [loyaltyRes, couponRes] = await Promise.all([
        fetch("/api/loyalty"),
        fetch("/api/loyalty/coupons"),
      ]);
      const loyaltyData = await loyaltyRes.json();
      const couponData = await couponRes.json();
      setMembers(loyaltyData.members || []);
      setTierCounts(loyaltyData.tierCounts || []);
      setCoupons(couponData.coupons || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function tierCount(tier) {
    return tierCounts.find((t) => t._id === tier)?.count || 0;
  }

  async function handleCreateCoupon() {
    if (!form.code || !form.value) {
      toast.error("Code and value are required.");
      return;
    }
    const res = await fetch("/api/loyalty/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.success) {
      toast.error(data.error || "Could not create coupon");
      return;
    }
    toast.success("Coupon created");
    setForm(EMPTY_COUPON);
    setDialogOpen(false);
    load();
  }

  async function toggleCoupon(coupon) {
    const res = await fetch(`/api/loyalty/coupons/${coupon._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`Coupon ${!coupon.isActive ? "activated" : "deactivated"}`);
      load();
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-gf-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-gf-cream">Loyalty &amp; Coupons</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Bronze" value={tierCount("bronze")} icon={Award} />
        <StatCard label="Silver" value={tierCount("silver")} icon={Award} />
        <StatCard label="Gold" value={tierCount("gold")} icon={Award} />
        <StatCard label="Platinum" value={tierCount("platinum")} icon={Award} />
      </div>

      <Tabs defaultValue="coupons">
        <TabsList>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="members">Top Members</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button variant="gold" size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="size-3.5" /> New Coupon
            </Button>
          </div>
          <div className="rounded-lg border border-gf-border bg-gf-bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-mono font-medium text-gf-gold">{c.code}</TableCell>
                    <TableCell>{c.type === "percent" ? `${c.value}%` : `$${c.value}`}</TableCell>
                    <TableCell className="text-gf-muted">${c.minOrderAmount || 0}</TableCell>
                    <TableCell className="text-gf-muted">
                      {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}
                    </TableCell>
                    <TableCell className="text-gf-muted">
                      {c.expiresAt ? formatDate(c.expiresAt) : "Never"}
                    </TableCell>
                    <TableCell>
                      <Switch checked={c.isActive} onCheckedChange={() => toggleCoupon(c)} />
                    </TableCell>
                  </TableRow>
                ))}
                {coupons.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-gf-muted-2">
                      No coupons yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-4 space-y-4">
          <div className="rounded-lg border border-gf-border bg-gf-bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m._id}>
                    <TableCell>
                      <p className="font-medium text-gf-cream">{m.name}</p>
                      <p className="text-xs text-gf-muted">{m.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="gold" className="capitalize">{m.loyaltyTier}</Badge>
                    </TableCell>
                    <TableCell className="text-gf-gold">{m.loyaltyPoints}</TableCell>
                    <TableCell className="font-mono text-xs text-gf-muted">{m.referralCode}</TableCell>
                    <TableCell className="text-gf-muted">{formatDate(m.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {members.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-gf-muted-2">
                      No loyalty members yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Gift className="size-4" /> New Coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Code</Label>
              <Input
                placeholder="WELCOME10"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent off</SelectItem>
                    <SelectItem value="fixed">Fixed amount off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Min order ($)</Label>
                <Input
                  type="number"
                  value={form.minOrderAmount}
                  onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Max total uses</Label>
                <Input
                  type="number"
                  placeholder="Unlimited"
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Expires</Label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="gold" onClick={handleCreateCoupon}>Create Coupon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
