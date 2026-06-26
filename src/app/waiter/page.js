"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Bell, Check, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleGuard } from "@/components/shared/role-guard";
import { useAuth } from "@/lib/auth/auth-context";
import { formatTime, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_VARIANT = {
  placed: "secondary",
  accepted: "gold",
  preparing: "warning",
  ready: "success",
  completed: "success",
};

function WaiterContent() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders?type=dine-in");
      const data = await res.json();
      setOrders((data.orders || []).filter((o) => !["completed", "cancelled", "rejected"].includes(o.status)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  async function updateStatus(orderId, status) {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`Order marked ${status}`);
      load();
    } else {
      toast.error(data.error);
    }
  }

  return (
    <div className="min-h-screen bg-gf-bg">
      <header className="flex h-16 items-center justify-between border-b border-gf-border bg-gf-bg-elevated px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="tine-divider" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </span>
          <span className="font-display text-lg text-gf-cream">Waiter Station</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gf-muted">{user?.name}</span>
          <Button size="sm" variant="outline" onClick={logout}>Log out</Button>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-display text-2xl text-gf-cream">Dine-in Orders</h1>
          <Badge variant="secondary">{orders.length} active</Badge>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-gf-gold" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-gf-border bg-gf-bg-card py-16 text-center text-gf-muted-2">
            No active dine-in orders right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <div key={order._id} className="rounded-lg border border-gf-border bg-gf-bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-display text-lg text-gf-cream">
                    <Utensils className="size-4 text-gf-gold" /> {order.table?.label || "Table"}
                  </span>
                  <Badge variant={STATUS_VARIANT[order.status] || "secondary"} className="capitalize">
                    {order.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-gf-muted">
                  #{order.orderNumber} · {formatTime(order.createdAt)}
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex justify-between text-gf-muted">
                      <span>{item.quantity}× {item.name}</span>
                      <Badge variant="secondary" className="text-[10px] capitalize">{item.status}</Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-gf-border pt-3">
                  <span className="text-gf-gold">{formatCurrency(order.total)}</span>
                  {order.status === "placed" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(order._id, "accepted")}>
                      <Check className="size-3.5" /> Accept
                    </Button>
                  )}
                  {order.status === "ready" && (
                    <Button size="sm" variant="gold" onClick={() => updateStatus(order._id, "completed")}>
                      <Bell className="size-3.5" /> Mark Served
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function WaiterPage() {
  return (
    <RoleGuard allowedRoles={["waiter", "manager", "admin"]}>
      <WaiterContent />
    </RoleGuard>
  );
}
