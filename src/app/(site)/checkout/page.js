"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Tag, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth/auth-context";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [type, setType] = useState("pickup");
  const [tables, setTables] = useState([]);
  const [table, setTable] = useState("");
  const [guest, setGuest] = useState({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", state: "", zip: "" });
  const [couponCode, setCouponCode] = useState("");
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [tip, setTip] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (type !== "dine-in") return;
    fetch("/api/tables?status=available")
      .then((r) => r.json())
      .then((d) => setTables(d.tables || []))
      .catch(() => setTables([]));
  }, [type]);

  const estimatedTax = useMemo(() => Math.round(subtotal * 0.08 * 100) / 100, [subtotal]);
  const deliveryFee = type === "delivery" && subtotal < 60 ? 4.99 : 0;
  const pointsDiscount = Math.round(redeemPoints * 0.01 * 100) / 100;
  const estimatedTotal = Math.max(
    0,
    subtotal + estimatedTax + deliveryFee - pointsDiscount + Number(tip || 0)
  );

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-gf-cream">Nothing to checkout</h1>
        <p className="mt-3 text-gf-muted">Add items to your cart first.</p>
        <Button variant="gold" className="mt-6" asChild>
          <Link href="/menu">Browse the Menu</Link>
        </Button>
      </div>
    );
  }

  async function handlePlaceOrder() {
    if (!user && (!guest.name || !guest.email || !guest.phone)) {
      toast.error("Please fill in your name, email, and phone.");
      return;
    }
    if (type === "delivery" && (!address.line1 || !address.city || !address.zip)) {
      toast.error("Please complete your delivery address.");
      return;
    }
    if (type === "dine-in" && !table) {
      toast.error("Please select a table.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          items: items.map((i) => ({
            menuItem: i.menuItem._id,
            quantity: i.quantity,
            notes: i.notes,
          })),
          guestInfo: user ? undefined : guest,
          deliveryAddress: type === "delivery" ? address : undefined,
          table: type === "dine-in" ? table : undefined,
          couponCode: couponCode || undefined,
          redeemPoints: Number(redeemPoints) || 0,
          tip: Number(tip) || 0,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Could not place order");
        return;
      }
      clearCart();
      toast.success("Order placed!");
      router.push(`/order-confirmation?order=${data.order._id}`);
    } catch {
      toast.error("Something went wrong placing your order.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl text-gf-cream">Checkout</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="mb-3 font-display text-xl text-gf-gold">Order Type</h2>
            <RadioGroup value={type} onValueChange={setType} className="grid grid-cols-3 gap-3">
              {[
                { value: "pickup", label: "Pickup" },
                { value: "delivery", label: "Delivery" },
                { value: "dine-in", label: "Dine-in" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-gf-border bg-gf-bg-card p-3 text-sm hover:border-gf-gold-dim"
                >
                  <RadioGroupItem value={opt.value} />
                  {opt.label}
                </label>
              ))}
            </RadioGroup>
          </section>

          {!user && (
            <section>
              <h2 className="mb-3 font-display text-xl text-gf-gold">Your Details</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Full name"
                  value={guest.name}
                  onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                />
                <Input
                  placeholder="Phone"
                  value={guest.phone}
                  onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                />
                <Input
                  className="sm:col-span-2"
                  placeholder="Email"
                  type="email"
                  value={guest.email}
                  onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                />
              </div>
              <p className="mt-2 text-xs text-gf-muted-2">
                Have an account? <Link href="/login" className="text-gf-gold">Sign in</Link> for loyalty points and order history.
              </p>
            </section>
          )}

          {type === "delivery" && (
            <section>
              <h2 className="mb-3 font-display text-xl text-gf-gold">Delivery Address</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  className="sm:col-span-2"
                  placeholder="Address line 1"
                  value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                />
                <Input
                  className="sm:col-span-2"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={address.line2}
                  onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                />
                <Input
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
                <Input
                  placeholder="State"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                />
                <Input
                  placeholder="ZIP code"
                  value={address.zip}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                />
              </div>
            </section>
          )}

          {type === "dine-in" && (
            <section>
              <h2 className="mb-3 font-display text-xl text-gf-gold">Select a Table</h2>
              <Select value={table} onValueChange={setTable}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an available table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.length === 0 && (
                    <SelectItem value="none" disabled>
                      No tables available right now
                    </SelectItem>
                  )}
                  {tables.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.label} — seats {t.capacity} ({t.location})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </section>
          )}

          <section>
            <h2 className="mb-3 font-display text-xl text-gf-gold">Payment</h2>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-3">
              {[
                { value: "card", label: "Card" },
                { value: "wallet", label: "Wallet" },
                { value: "cash", label: "Cash" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-gf-border bg-gf-bg-card p-3 text-sm hover:border-gf-gold-dim"
                >
                  <RadioGroupItem value={opt.value} />
                  {opt.label}
                </label>
              ))}
            </RadioGroup>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl text-gf-gold">Coupon &amp; Rewards</h2>
            <div className="space-y-3">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gf-muted" />
                <Input
                  className="pl-9"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
              </div>
              {user && (
                <div className="flex items-center gap-3 rounded-md border border-gf-border bg-gf-bg-card p-3">
                  <Gift className="size-4 text-gf-gold shrink-0" />
                  <div className="flex-1 text-sm">
                    <p className="text-gf-cream">You have {user.loyaltyPoints} points</p>
                    <p className="text-xs text-gf-muted">100 points = $1 off</p>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    max={user.loyaltyPoints}
                    step={100}
                    className="w-24"
                    value={redeemPoints}
                    onChange={(e) =>
                      setRedeemPoints(Math.min(Number(e.target.value) || 0, user.loyaltyPoints))
                    }
                  />
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl text-gf-gold">Add a Tip</h2>
            <div className="flex gap-2">
              {[0, 0.1, 0.15, 0.2].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setTip(Math.round(subtotal * pct * 100) / 100)}
                  className="flex-1 rounded-md border border-gf-border bg-gf-bg-card py-2 text-sm hover:border-gf-gold-dim"
                >
                  {pct === 0 ? "No tip" : `${pct * 100}%`}
                </button>
              ))}
            </div>
            <Input
              type="number"
              min={0}
              className="mt-2"
              placeholder="Custom tip amount"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
            />
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border border-gf-border bg-gf-bg-card p-5">
            <h3 className="font-display text-lg text-gf-gold">Order Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              {items.map((i) => (
                <div key={`${i.menuItem._id}-${i.notes}`} className="flex justify-between text-gf-muted">
                  <span>{i.quantity}× {i.menuItem.name}</span>
                  <span className="text-gf-cream">{formatCurrency(i.menuItem.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 border-t border-gf-border pt-4 text-sm">
              <div className="flex justify-between text-gf-muted">
                <span>Subtotal</span><span className="text-gf-cream">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gf-muted">
                <span>Tax (est.)</span><span className="text-gf-cream">{formatCurrency(estimatedTax)}</span>
              </div>
              {type === "delivery" && (
                <div className="flex justify-between text-gf-muted">
                  <span>Delivery fee</span>
                  <span className="text-gf-cream">{deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}</span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-gf-success">
                  <span>Points discount</span><span>-{formatCurrency(pointsDiscount)}</span>
                </div>
              )}
              {Number(tip) > 0 && (
                <div className="flex justify-between text-gf-muted">
                  <span>Tip</span><span className="text-gf-cream">{formatCurrency(tip)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gf-border pt-2 font-display text-lg text-gf-gold">
                <span>Total (est.)</span><span>{formatCurrency(estimatedTotal)}</span>
              </div>
            </div>

            <Button
              variant="gold"
              size="lg"
              className="mt-5 w-full"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
