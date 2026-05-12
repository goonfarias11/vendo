// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea centavos a string de moneda: 135000 → "$1.350" */
export function formatPrice(cents: number, currency = "ARS"): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Convierte un precio "humano" (350) a centavos (35000) */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/** Convierte centavos a precio humano */
export function fromCents(cents: number): number {
  return cents / 100;
}

/** Genera un slug válido desde un nombre */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "")
    .replace(/-+/g, "-")
    .trim();
}

/** Construye el mensaje de WhatsApp con el carrito */
export function buildWhatsAppMessage(
  items: { name: string; qty: number; price: number }[],
  storeName: string,
  total: number
): string {
  const lines = items.map(
    (i) => `• ${i.qty}x ${i.name} — ${formatPrice(i.price * i.qty)}`
  );
  return [
    `Hola *${storeName}*! Quiero hacer el siguiente pedido 🛍️`,
    "",
    ...lines,
    "",
    `*Total: ${formatPrice(total)}*`,
    "",
    "¡Muchas gracias!",
  ].join("\n");
}

/** Construye la URL de WhatsApp */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
