// src/types/index.ts
import type { Store, Product, Category, Order, OrderItem, OrderStatus } from "@prisma/client";

// ─── Store con relaciones ───────────────────────────────────────────
export type StoreWithProducts = Store & {
  products: ProductWithCategory[];
  categories: Category[];
};

export type ProductWithCategory = Product & {
  category: Category | null;
};

// ─── Carrito (frontend only) ────────────────────────────────────────
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  emoji: string | null;
  qty: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  totalItems: number;
}

// ─── Pedido con items ───────────────────────────────────────────────
export type OrderWithItems = Order & {
  items: OrderItem[];
};

// ─── API Response wrapper ───────────────────────────────────────────
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Formularios ────────────────────────────────────────────────────
export interface CreateStoreInput {
  name: string;
  slug: string;
  whatsapp: string;
  category?: string;
  description?: string;
  primaryColor?: string;
}

export interface CreateProductInput {
  name: string;
  price: number;
  categoryId?: string;
  description?: string;
  emoji?: string;
  imageUrl?: string;
  available?: boolean;
  featured?: boolean;
}

export interface CreateOrderInput {
  storeId: string;
  customerName: string;
  customerPhone?: string;
  customerNote?: string;
  items: { productId: string; qty: number }[];
}

// ─── Dashboard stats ─────────────────────────────────────────────────
export interface DashboardStats {
  ordersToday: number;
  revenueToday: number;
  visitsToday: number;
  topProduct: string | null;
  ordersThisMonth: number;
  revenueThisMonth: number;
}

// Re-export Prisma enums para no importarlos desde @prisma/client en el cliente
export type { OrderStatus };
