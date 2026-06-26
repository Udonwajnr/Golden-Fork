"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/auth-context";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const STATUS_VARIANT = {
  placed: "secondary",
  accepted: "gold",
  preparing: "warning",
  ready: "success",
  "out-for-delivery": "gold",
  completed: "success",
  rejected: "danger",
  cancelled: "danger",
};

export default function OrderHistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login?redirect=/account/orders");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setIsLoading(false));
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-gf-gold" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl text-gf-cream">Order History</h1>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-lg border border-gf-border bg-gf-bg-card p-10 text-center">
          <p className="text-gf-muted">You haven&apos;t placed any orders yet.</p>
          <Link href="/menu" className="mt-3 inline-block text-gf-gold hover:underline">
            Browse the Menu
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="flex items-center justify-between gap-4 rounded-lg border border-gf-border bg-gf-bg-card p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gf-cream">#{order.orderNumber}</span>
                  <Badge variant={STATUS_VARIANT[order.status] || "secondary"} className="capitalize">
                    {order.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-gf-muted">
                  {formatDateTime(order.createdAt)} · {order.items.length} item(s) · {order.type}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-gf-gold">{formatCurrency(order.total)}</span>
                <ChevronRight className="size-4 text-gf-muted" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
