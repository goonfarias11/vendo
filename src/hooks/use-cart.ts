// src/hooks/use-cart.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">) => void;
  remove: (productId: string) => void;
  increment: (productId: string) => void;
  clear: () => void;
  total: () => number;
  totalItems: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, qty: 1 }] };
        }),

      remove: (productId) =>
        set((state) => {
          const item = state.items.find((i) => i.productId === productId);
          if (!item) return state;
          if (item.qty <= 1) {
            return { items: state.items.filter((i) => i.productId !== productId) };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, qty: i.qty - 1 } : i
            ),
          };
        }),

      increment: (productId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, qty: i.qty + 1 } : i
          ),
        })),

      clear: () => set({ items: [] }),

      total: () =>
        get().items.reduce((sum, item) => sum + item.price * item.qty, 0),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.qty, 0),
    }),
    {
      name: "vendo-cart",
    }
  )
);
