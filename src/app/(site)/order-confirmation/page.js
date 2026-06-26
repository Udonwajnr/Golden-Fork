"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order))
      .finally(() => setIsLoading(false));
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-gf-gold" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-gf-cream">Order not found</h1>
        <Button variant="gold" className="mt-6" asChild>
          <Link href="/menu">Back to Menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-14 text-gf-success" />
        <h1 className="mt-4 font-display text-4xl text-gf-cream">Order Confirmed</h1>
        <p className="mt-2 text-gf-muted">Order #{order.orderNumber}</p>
      </div>

      <div className="mt-8 rounded-lg border border-gf-border bg-gf-bg-card p-6">
        <div className="flex items-center justify-between">
          <Badge variant="gold" className="capitalize">{order.status}</Badge>
          <span className="flex items-center gap-1.5 text-xs text-gf-muted">
            <Clock className="size-3.5" /> {formatDateTime(order.createdAt)}
          </span>
        </div>

        <div className="mt-5 divide-y divide-gf-border">
          {order.items.map((item) => (
            <div key={item._id} className="flex justify-between py-2.5 text-sm">
              <span className="text-gf-muted">{item.quantity}× {item.name}</span>
              <span className="text-gf-cream">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-gf-border pt-4 text-sm">
          <div className="flex justify-between text-gf-muted">
            <span>Subtotal</span><span className="text-gf-cream">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gf-muted">
            <span>Tax</span><span className="text-gf-cream">{formatCurrency(order.tax)}</span>
          </div>
          {order.deliveryFee > 0 && (
            <div className="flex justify-between text-gf-muted">
              <span>Delivery</span><span className="text-gf-cream">{formatCurrency(order.deliveryFee)}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-gf-success">
              <span>Discount</span><span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gf-border pt-2 font-display text-lg text-gf-gold">
            <span>Total</span><span>{formatCurrency(order.total)}</span>
          </div>
        </div>

        {order.type === "delivery" && order.deliveryAddress && (
          <div className="mt-4 flex items-start gap-2 rounded-md bg-gf-bg-elevated p-3 text-sm text-gf-muted">
            <MapPin className="size-4 shrink-0 text-gf-gold mt-0.5" />
            <span>
              {order.deliveryAddress.line1}, {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zip}
            </span>
          </div>
        )}

        {order.loyaltyPointsEarned > 0 && (
          <p className="mt-4 text-center text-sm text-gf-gold">
            You earned {order.loyaltyPointsEarned} loyalty points on this order 🎉
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/menu">Order More</Link>
        </Button>
        <Button variant="gold" className="flex-1" asChild>
          <Link href="/account/orders">Track Order</Link>
        </Button>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-gf-gold" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
