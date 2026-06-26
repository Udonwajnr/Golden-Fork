"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu as MenuIcon, X, ShoppingBag, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth/auth-context";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/reservations", label: "Reservations" },
  { href: "/#story", label: "Our Story" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gf-border-soft bg-gf-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="tine-divider" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </span>
          <span className="font-display text-xl tracking-wide text-gf-cream">
            The Golden Fork
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm tracking-wide text-gf-muted transition-colors hover:text-gf-gold",
                pathname === link.href && "text-gf-gold"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="View cart">
              <ShoppingBag className="size-5" />
            </Button>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gf-gold text-[10px] font-bold text-gf-bg">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <UserIcon className="size-4" />
                  {user.name?.split(" ")[0]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">My Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/orders">Order History</Link>
                </DropdownMenuItem>
                {["waiter", "kitchen", "manager", "admin"].includes(user.role) && (
                  <DropdownMenuItem asChild>
                    <Link href={user.role === "waiter" ? "/waiter" : user.role === "kitchen" ? "/kitchen" : "/admin"}>
                      Staff Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-gf-danger">
                  <LogOut className="size-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}

          <Button variant="gold" size="sm" asChild>
            <Link href="/reservations">Reserve a Table</Link>
          </Button>
        </div>

        <button
          className="md:hidden text-gf-cream"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-6" /> : <MenuIcon className="size-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gf-border-soft bg-gf-bg px-4 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-gf-muted hover:text-gf-gold py-1.5"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/cart"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-gf-muted hover:text-gf-gold py-1.5"
          >
            Cart {itemCount > 0 ? `(${itemCount})` : ""}
          </Link>
          {user ? (
            <>
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="block text-sm text-gf-muted hover:text-gf-gold py-1.5"
              >
                My Account
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="block text-sm text-gf-danger py-1.5"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-gf-muted hover:text-gf-gold py-1.5"
            >
              Sign In
            </Link>
          )}
          <Button variant="gold" className="w-full mt-2" asChild>
            <Link href="/reservations" onClick={() => setMobileOpen(false)}>
              Reserve a Table
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
}