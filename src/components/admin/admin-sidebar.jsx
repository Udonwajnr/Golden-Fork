"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Users,
  Package,
  BarChart3,
  CalendarDays,
  Gift,
  Sparkles,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/reservations", label: "Reservations", icon: CalendarDays },
      { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
      { href: "/admin/staff", label: "Staff", icon: Users },
      { href: "/admin/inventory", label: "Inventory", icon: Package },
      { href: "/admin/messages", label: "Messages", icon: MessageSquare, badgeKey: "messages" },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/loyalty", label: "Loyalty & Coupons", icon: Gift },
      { href: "/admin/ai-insights", label: "AI Insights", icon: Sparkles },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadUnread() {
      try {
        const res = await fetch("/api/contact?status=new");
        const data = await res.json();
        if (!cancelled) setUnreadMessages(data.unreadCount || 0);
      } catch {
        // ignore - badge just stays at 0
      }
    }
    loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-gf-border bg-gf-bg-elevated lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-gf-border px-5">
        <span className="tine-divider" aria-hidden="true">
          <span /><span /><span /><span /><span />
        </span>
        <span className="font-display text-lg text-gf-cream">Golden Fork</span>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gf-muted-2">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href;
                const badgeCount = item.badgeKey === "messages" ? unreadMessages : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "bg-gf-gold/10 text-gf-gold font-medium"
                        : "text-gf-muted hover:bg-gf-bg-card hover:text-gf-cream"
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                    {badgeCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gf-gold px-1.5 text-[10px] font-bold text-gf-bg">
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-gf-border p-3">
        <div className="flex items-center justify-between rounded-md px-2 py-2">
          <div className="text-sm">
            <p className="text-gf-cream">{user?.name}</p>
            <p className="text-xs text-gf-muted-2 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gf-muted hover:text-gf-danger"
            aria-label="Log out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}