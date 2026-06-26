"use client";

import { useState } from "react";
import { Plus, Minus, Flame, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const TAG_ICON = {
  spicy: Flame,
  vegan: Leaf,
  "gluten-free": Leaf,
};

export function MenuItemCard({ item }) {
  const { addItem } = useCart();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  function handleQuickAdd() {
    addItem(item, 1, "");
    toast.success(`${item.name} added to cart`);
  }

  function handleConfirmAdd() {
    addItem(item, quantity, notes.trim());
    toast.success(`${quantity} × ${item.name} added to cart`);
    setOpen(false);
    setQuantity(1);
    setNotes("");
  }

  return (
    <>
      <div className="group flex gap-4 rounded-lg border border-gf-border bg-gf-bg-card p-4 transition-colors hover:border-gf-gold-dim">
        <button
          onClick={() => setOpen(true)}
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-gf-bg-elevated"
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gf-muted-2 text-xs">
              No image
            </div>
          )}
        </button>

        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => setOpen(true)}
              className="text-left font-display text-lg text-gf-cream hover:text-gf-gold transition-colors"
            >
              {item.name}
            </button>
            <span className="shrink-0 font-medium text-gf-gold">
              {formatCurrency(item.price)}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-gf-muted">{item.description}</p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {(item.tags || []).slice(0, 3).map((tag) => {
              const Icon = TAG_ICON[tag];
              return (
                <Badge key={tag} variant="secondary" className="text-[10px] capitalize">
                  {Icon && <Icon className="size-3" />}
                  {tag}
                </Badge>
              );
            })}
          </div>

          <div className="mt-auto flex items-center justify-between pt-3">
            <span className="text-xs text-gf-muted-2">{item.prepTimeMinutes || 15} min</span>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={handleQuickAdd}>
              <Plus className="size-3.5" /> Add
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
            <DialogDescription>{item.description}</DialogDescription>
          </DialogHeader>

          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-48 w-full rounded-md object-cover"
            />
          )}

          <div className="flex items-center justify-between">
            <span className="font-display text-2xl text-gf-gold">
              {formatCurrency(item.price)}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(item.tags || []).map((tag) => (
                <Badge key={tag} variant="secondary" className="capitalize text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {item.allergens?.length > 0 && (
            <p className="text-xs text-gf-muted">
              Contains: {item.allergens.join(", ")}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Special instructions (optional)</Label>
            <Textarea
              id="notes"
              placeholder="No onions, extra sauce on the side, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Label className="shrink-0">Quantity</Label>
            <div className="flex items-center gap-3 rounded-md border border-gf-border px-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 text-gf-muted hover:text-gf-gold"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2 text-gf-muted hover:text-gf-gold"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="gold" onClick={handleConfirmAdd} className="w-full">
              Add {quantity} to Cart · {formatCurrency(item.price * quantity)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
