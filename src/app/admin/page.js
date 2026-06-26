"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics?range=30d").then((r) => r.json()),
      fetch("/api/orders?limit=6").then((r) => r.json()),
    ])
      .then(([analytics, orders]) => {
        setData(analytics);
        setRecentOrders(orders.orders || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-gf-gold" />
      </div>
    );
  }

  const chartData = data.revenueByDay.map((d) => ({
    date: d._id.slice(5),
    revenue: Math.round(d.revenue * 100) / 100,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-gf-cream">Dashboard</h1>
          <p className="text-sm text-gf-muted">Last 30 days at a glance</p>
        </div>
        <Button variant="gold" size="sm" asChild>
          <Link href="/admin/ai-insights">View AI Insights</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue (30d)"
          value={formatCurrency(data.summary.revenue)}
          icon={DollarSign}
        />
        <StatCard label="Orders (30d)" value={data.summary.orders} icon={ShoppingBag} />
        <StatCard
          label="Avg Order Value"
          value={formatCurrency(data.summary.avgOrderValue)}
          icon={DollarSign}
        />
        <StatCard
          label="Pending Orders"
          value={data.summary.pendingOrders}
          icon={ShoppingBag}
          accent={data.summary.pendingOrders > 0}
        />
      </div>

      {data.summary.lowStockCount > 0 && (
        <Link
          href="/admin/inventory"
          className="flex items-center gap-3 rounded-lg border border-gf-warning/40 bg-gf-warning/10 p-4 text-sm text-gf-warning hover:bg-gf-warning/15"
        >
          <AlertTriangle className="size-4 shrink-0" />
          {data.summary.lowStockCount} ingredient(s) are running low on stock.
          <ArrowRight className="size-3.5 ml-auto" />
        </Link>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-gf-border bg-gf-bg-card p-5 lg:col-span-2">
          <h3 className="font-display text-lg text-gf-gold">Revenue Trend</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#2a2825" vertical={false} />
                <XAxis dataKey="date" stroke="#9a948a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9a948a" fontSize={11} tickLine={false} axisLine={false} width={50} />
                <Tooltip
                  contentStyle={{ background: "#141413", border: "1px solid #2a2825", borderRadius: 8 }}
                  labelStyle={{ color: "#f5f0e6" }}
                  formatter={(v) => [`$${v}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#d4af37" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-gf-border bg-gf-bg-card p-5">
          <h3 className="font-display text-lg text-gf-gold">Best Sellers</h3>
          <div className="mt-4 space-y-3">
            {data.bestSellers.slice(0, 6).map((item, idx) => (
              <div key={item._id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gf-muted">
                  <span className="text-gf-muted-2">{idx + 1}.</span> {item._id}
                </span>
                <span className="text-gf-cream">{formatCurrency(item.revenue)}</span>
              </div>
            ))}
            {data.bestSellers.length === 0 && (
              <p className="text-sm text-gf-muted-2">No sales data yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gf-border bg-gf-bg-card">
        <div className="flex items-center justify-between p-5 pb-0">
          <h3 className="font-display text-lg text-gf-gold">Recent Orders</h3>
          <Link href="/admin/orders" className="text-xs text-gf-muted hover:text-gf-gold">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gf-border p-5 pt-3">
          {recentOrders.map((order) => (
            <div key={order._id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="text-gf-cream">#{order.orderNumber}</p>
                <p className="text-xs text-gf-muted">
                  {order.customer?.name || order.guestInfo?.name || "Guest"} · {formatDateTime(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="capitalize">{order.status}</Badge>
                <span className="text-gf-gold">{formatCurrency(order.total)}</span>
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && (
            <p className="py-6 text-center text-sm text-gf-muted-2">No orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
