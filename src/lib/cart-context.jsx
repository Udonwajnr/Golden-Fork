"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "gf_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ menuItem: {...}, quantity, notes }]
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  const addItem = useCallback((menuItem, quantity = 1, notes = "") => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.menuItem._id === menuItem._id && i.notes === notes
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + quantity,
        };
        return next;
      }
      return [...prev, { menuItem, quantity, notes }];
    });
  }, []);

  const updateQuantity = useCallback((menuItemId, notes, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter(
          (i) => !(i.menuItem._id === menuItemId && i.notes === notes)
        );
      }
      return prev.map((i) =>
        i.menuItem._id === menuItemId && i.notes === notes
          ? { ...i, quantity }
          : i
      );
    });
  }, []);

  const removeItem = useCallback((menuItemId, notes) => {
    setItems((prev) =>
      prev.filter((i) => !(i.menuItem._id === menuItemId && i.notes === notes))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        itemCount,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
