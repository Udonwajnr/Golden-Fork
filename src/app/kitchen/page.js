"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Flame, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleGuard } from "@/components/shared/role-guard";
import { useAuth } from "@/lib/auth/auth-context";
import { formatTime, cn } from "@/lib/utils";
import { toast } from "sonner";

const ITEM_NEXT = { pending: "preparing", preparing: "ready", ready: "served" };
const ITEM_LABEL = { pending: "Start", preparing: "Mark Ready", ready: "Mark Served" };

function KitchenContent() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(
        (data.orders || []).filter((o) =>
          ["accepted", "preparing", "ready"].includes(o.status)
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  async function advanceItem(orderId, itemId, currentStatus) {
    const nextStatus = ITEM_NEXT[currentStatus];
    if (!nextStatus) return;

    const res = await fetch(`/api/orders/${orderId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await res.json();
    if (data.success) {
      load();
    } else {
      toast.error(data.error);
    }
  }

  async function markOrderPreparing(orderId) {
    await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "preparing" }),
    });
    load();
  }

  return (
    <div className="min-h-screen bg-gf-bg">
      <header className="flex h-16 items-center justify-between border-b border-gf-border bg-gf-bg-elevated px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Flame className="size-5 text-gf-gold" />
          <span className="font-display text-lg text-gf-cream">Kitchen Display</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gf-muted">{user?.name}</span>
          <Button size="sm" variant="outline" onClick={logout}>Log out</Button>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-gf-gold" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-gf-border bg-gf-bg-card py-16 text-center text-gf-muted-2">
            No orders in the kitchen queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className={cn(
                  "rounded-lg border bg-gf-bg-card p-4",
                  order.status === "ready" ? "border-gf-success/50" : "border-gf-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg text-gf-cream">#{order.orderNumber.slice(-6)}</span>
                  <span className="flex items-center gap-1 text-xs text-gf-muted">
                    <Clock className="size-3" /> {formatTime(order.createdAt)}
                  </span>
                </div>
                <p className="text-xs uppercase tracking-wide text-gf-muted-2">
                  {order.type} {order.table?.label ? `· ${order.table.label}` : ""}
                </p>

                {order.status === "accepted" && (
                  <Button
                    size="sm"
                    variant="gold"
                    className="mt-3 w-full"
                    onClick={() => markOrderPreparing(order._id)}
                  >
                    Start Preparing
                  </Button>
                )}

                <div className="mt-3 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item._id}
                      className={cn(
                        "rounded-md border border-gf-border p-2.5",
                        item.status === "ready" && "bg-gf-success/10 border-gf-success/30",
                        item.status === "served" && "opacity-50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gf-cream">
                          {item.quantity}× {item.name}
                        </span>
                        <Badge variant="secondary" className="text-[10px] capitalize">{item.status}</Badge>
                      </div>
                      {item.notes && <p className="mt-1 text-xs italic text-gf-muted">{item.notes}</p>}
                      {ITEM_NEXT[item.status] && order.status !== "accepted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full"
                          onClick={() => advanceItem(order._id, item._id, item.status)}
                        >
                          {item.status === "ready" ? (
                            <CheckCircle2 className="size-3.5" />
                          ) : null}
                          {ITEM_LABEL[item.status]}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function KitchenPage() {
  return (
    <RoleGuard allowedRoles={["kitchen", "manager", "admin"]}>
      <KitchenContent />
    </RoleGuard>
  );
}
