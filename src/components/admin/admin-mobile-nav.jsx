"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu as MenuIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

const FLAT_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/loyalty", label: "Loyalty & Coupons" },
  { href: "/admin/ai-insights", label: "AI Insights" },
];

export function AdminMobileNav({ title }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-16 items-center justify-between border-b border-gf-border bg-gf-bg-elevated px-4 lg:hidden">
      <span className="font-display text-lg text-gf-cream">{title || "Admin"}</span>
      <button onClick={() => setOpen(true)} aria-label="Open menu">
        <MenuIcon className="size-6 text-gf-cream" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-gf-bg">
          <div className="flex h-16 items-center justify-between border-b border-gf-border px-4">
            <span className="font-display text-lg text-gf-cream">Menu</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="size-6 text-gf-cream" />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {FLAT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-2.5 text-sm",
                  pathname === link.href
                    ? "bg-gf-gold/10 text-gf-gold"
                    : "text-gf-muted hover:bg-gf-bg-elevated"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}