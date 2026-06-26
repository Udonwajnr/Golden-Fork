"use client";

import { useEffect, useState } from "react";
import { Loader2, DollarSign, Users, TrendingUp, Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/admin/stat-card";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#d4af37", "#8a7430", "#5b9a6f", "#c98a3f"];

function hourLabel(h) {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/analytics?range=${range}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setIsLoading(false));
  }, [range]);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-gf-gold" />
      </div>
    );
  }

  const peakData = Array.from({ length: 24 }, (_, h) => {
    const found = data.peakHours.find((p) => p._id === h);
    return { hour: hourLabel(h), orders: found?.orders || 0 };
  }).filter((d, i) => i >= 8 && i <= 23); // restaurant hours-ish

  const orderTypeData = data.orderTypeSplit.map((o) => ({
    name: o._id,
    value: o.count,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-gf-cream">Analytics</h1>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(data.summary.revenue)} icon={DollarSign} />
        <StatCard label="Total Orders" value={data.summary.orders} icon={TrendingUp} />
        <StatCard label="New Customers" value={data.summary.newCustomers} icon={Users} />
        <StatCard label="Returning Customers" value={data.summary.returningCustomers} icon={Users} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gf-border bg-gf-bg-card p-5">
          <h3 className="flex items-center gap-2 font-display text-lg text-gf-gold">
            <Clock className="size-4" /> Peak Order Times
          </h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakData}>
                <CartesianGrid stroke="#2a2825" vertical={false} />
                <XAxis dataKey="hour" stroke="#9a948a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9a948a" fontSize={11} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={{ background: "#141413", border: "1px solid #2a2825", borderRadius: 8 }} labelStyle={{ color: "#f5f0e6" }} />
                <Bar dataKey="orders" fill="#d4af37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-gf-border bg-gf-bg-card p-5">
          <h3 className="font-display text-lg text-gf-gold">Order Type Split</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {orderTypeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#141413", border: "1px solid #2a2825", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#9a948a" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gf-border bg-gf-bg-card p-5">
        <h3 className="font-display text-lg text-gf-gold">Revenue Over Time</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.revenueByDay.map((d) => ({ date: d._id.slice(5), revenue: d.revenue, orders: d.orders }))}>
              <CartesianGrid stroke="#2a2825" vertical={false} />
              <XAxis dataKey="date" stroke="#9a948a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#9a948a" fontSize={11} tickLine={false} axisLine={false} width={50} />
              <Tooltip contentStyle={{ background: "#141413", border: "1px solid #2a2825", borderRadius: 8 }} labelStyle={{ color: "#f5f0e6" }} />
              <Line type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-gf-border bg-gf-bg-card p-5">
        <h3 className="font-display text-lg text-gf-gold">Best Selling Items</h3>
        <div className="mt-4 space-y-2">
          {data.bestSellers.map((item) => {
            const max = data.bestSellers[0]?.revenue || 1;
            const pct = (item.revenue / max) * 100;
            return (
              <div key={item._id}>
                <div className="flex justify-between text-sm">
                  <span className="text-gf-cream">{item._id}</span>
                  <span className="text-gf-muted">{formatCurrency(item.revenue)} · {item.quantity} sold</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-gf-bg-elevated">
                  <div className="h-full rounded-full bg-gf-gold" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
