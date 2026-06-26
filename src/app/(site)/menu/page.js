"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Search, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MenuItemCard } from "@/components/site/menu-item-card";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { itemCount, subtotal } = useCart();

  const loadMenu = useCallback(async (q = "") => {
    setIsLoading(true);
    try {
      const [catRes, itemRes] = await Promise.all([
        fetch("/api/menu/categories"),
        fetch(`/api/menu${q ? `?q=${encodeURIComponent(q)}` : ""}`),
      ]);
      const catData = await catRes.json();
      const itemData = await itemRes.json();
      setCategories(catData.categories || []);
      setItems(itemData.items || []);
    } catch {
      // swallow - empty state will show
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  useEffect(() => {
    const handle = setTimeout(() => {
      loadMenu(search);
    }, 350);
    return () => clearTimeout(handle);
  }, [search, loadMenu]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((i) => i.category?._id === activeCategory || i.category === activeCategory);
  }, [items, activeCategory]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const item of filteredItems) {
      const key = item.category?.name || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return Array.from(map.entries());
  }, [filteredItems]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gf-gold">
          Order Online
        </p>
        <h1 className="mt-3 font-display text-4xl text-gf-cream sm:text-5xl">
          The Full Menu
        </h1>
        <p className="mt-3 text-gf-muted">
          Delivery, pickup, or dine-in — browse and add to your order.
        </p>
      </div>

      <div className="sticky top-18 z-30 mt-10 -mx-4 bg-gf-bg/95 px-4 py-4 backdrop-blur-md sm:mx-0 sm:px-0">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gf-muted" />
          <Input
            placeholder="Search dishes, ingredients, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          <CategoryPill
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          >
            All
          </CategoryPill>
          {categories.map((cat) => (
            <CategoryPill
              key={cat._id}
              active={activeCategory === cat._id}
              onClick={() => setActiveCategory(cat._id)}
            >
              {cat.name}
            </CategoryPill>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-12">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))
        ) : grouped.length === 0 ? (
          <div className="rounded-lg border border-gf-border bg-gf-bg-card py-16 text-center">
            <p className="text-gf-muted">No dishes match your search right now.</p>
          </div>
        ) : (
          grouped.map(([categoryName, categoryItems]) => (
            <section key={categoryName}>
              <h2 className="mb-4 font-display text-2xl text-gf-gold">{categoryName}</h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {categoryItems.map((item) => (
                  <MenuItemCard key={item._id} item={item} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gf-border bg-gf-bg-elevated/95 backdrop-blur-md sm:bottom-4 sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:rounded-full sm:border">
          <Link
            href="/cart"
            className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-gf-cream">
              <ShoppingBag className="size-4 text-gf-gold" />
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </span>
            <Button variant="gold" size="sm">
              View Cart · ${subtotal.toFixed(2)}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function CategoryPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-1.5 text-sm whitespace-nowrap transition-colors",
        active
          ? "border-gf-gold bg-gf-gold text-gf-bg font-medium"
          : "border-gf-border text-gf-muted hover:border-gf-gold-dim hover:text-gf-gold"
      )}
    >
      {children}
    </button>
  );
}
