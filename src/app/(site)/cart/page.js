"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-gf-cream">Your cart is empty</h1>
        <p className="mt-3 text-gf-muted">Add a few dishes from the menu to get started.</p>
        <Button variant="gold" className="mt-6" asChild>
          <Link href="/menu">Browse the Menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/menu"
        className="inline-flex items-center gap-1.5 text-sm text-gf-muted hover:text-gf-gold"
      >
        <ArrowLeft className="size-4" /> Continue browsing
      </Link>

      <h1 className="mt-4 font-display text-4xl text-gf-cream">Your Order</h1>

      <div className="mt-8 divide-y divide-gf-border rounded-lg border border-gf-border bg-gf-bg-card">
        {items.map((item) => (
          <div key={`${item.menuItem._id}-${item.notes}`} className="flex gap-4 p-5">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gf-bg-elevated">
              {item.menuItem.imageUrl && (
                <img
                  src={item.menuItem.imageUrl}
                  alt={item.menuItem.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg text-gf-cream">{item.menuItem.name}</h3>
                <span className="shrink-0 font-medium text-gf-gold">
                  {formatCurrency(item.menuItem.price * item.quantity)}
                </span>
              </div>
              {item.notes && (
                <p className="mt-0.5 text-xs italic text-gf-muted">&quot;{item.notes}&quot;</p>
              )}

              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex items-center gap-3 rounded-md border border-gf-border px-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.menuItem._id, item.notes, item.quantity - 1)
                    }
                    className="p-1.5 text-gf-muted hover:text-gf-gold"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.menuItem._id, item.notes, item.quantity + 1)
                    }
                    className="p-1.5 text-gf-muted hover:text-gf-gold"
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.menuItem._id, item.notes)}
                  className="flex items-center gap-1 text-xs text-gf-danger hover:underline"
                >
                  <Trash2 className="size-3.5" /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-gf-border bg-gf-bg-card p-5">
        <div className="flex justify-between text-sm text-gf-muted">
          <span>Subtotal</span>
          <span className="text-gf-cream">{formatCurrency(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-gf-muted-2">
          Tax, delivery fee, and tip are calculated at checkout.
        </p>
      </div>

      <Button
        variant="gold"
        size="lg"
        className="mt-6 w-full"
        onClick={() => router.push("/checkout")}
      >
        Proceed to Checkout
      </Button>
    </div>
  );
}
