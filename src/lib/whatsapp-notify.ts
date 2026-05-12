// src/lib/whatsapp-notify.ts
// Integración con WhatsApp Business API (Meta) para notificaciones automáticas
// Requiere: WA_BUSINESS_TOKEN y WA_PHONE_NUMBER_ID en .env

import { formatPrice } from "./utils";

interface OrderNotifyPayload {
  customerPhone: string;
  customerName: string;
  orderNumber: number;
  storeName: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: "CONFIRMED" | "PREPARING" | "READY" | "DELIVERED";
}

const STATUS_MESSAGES: Record<string, (p: OrderNotifyPayload) => string> = {
  CONFIRMED: (p) =>
    `✅ ¡Hola ${p.customerName}! Tu pedido *#${p.orderNumber}* en *${p.storeName}* fue confirmado.\n\nTotal: *${formatPrice(p.total)}*\n\nTe avisamos cuando esté listo 🙌`,
  PREPARING: (p) =>
    `👨‍🍳 ¡Tu pedido *#${p.orderNumber}* ya está siendo preparado en *${p.storeName}*! Un momentito...`,
  READY: (p) =>
    `🎉 ¡Tu pedido *#${p.orderNumber}* está LISTO para retirar en *${p.storeName}*!\n\nTotal a pagar: *${formatPrice(p.total)}*`,
  DELIVERED: (p) =>
    `✔️ ¡Tu pedido *#${p.orderNumber}* fue entregado! Gracias por elegirnos 💚\n\n_${p.storeName}_`,
};

export async function sendWhatsAppNotification(payload: OrderNotifyPayload): Promise<boolean> {
  const token = process.env.WA_BUSINESS_TOKEN;
  const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn("[WA Notify] WA_BUSINESS_TOKEN o WA_PHONE_NUMBER_ID no configurados");
    return false;
  }

  const message = STATUS_MESSAGES[payload.status]?.(payload);
  if (!message) return false;

  // Limpiar número de teléfono
  const to = payload.customerPhone.replace(/\D/g, "");
  if (to.length < 10) {
    console.warn("[WA Notify] Número de teléfono inválido:", payload.customerPhone);
    return false;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { preview_url: false, body: message },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error("[WA Notify] Error:", err);
      return false;
    }

    console.log(`[WA Notify] Mensaje enviado a ${to} — status: ${payload.status}`);
    return true;
  } catch (err) {
    console.error("[WA Notify] Error de red:", err);
    return false;
  }
}
