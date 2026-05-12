// src/components/admin/orders-manager.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import type { OrderWithItems } from "@/types";
import type { OrderStatus } from "@prisma/client";
import { formatPrice, buildWhatsAppUrl, buildWhatsAppMessage } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  NEW: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "DELIVERED",
  DELIVERED: null,
  CANCELLED: null,
};

const STATUS_ACTION: Partial<Record<OrderStatus, string>> = {
  NEW: "Confirmar pedido",
  CONFIRMED: "Iniciar preparación",
  PREPARING: "Marcar listo",
  READY: "Marcar entregado",
};

const FILTERS = [
  { value: "all", label: "Todos" },
  { value: "NEW", label: "Nuevos" },
  { value: "CONFIRMED", label: "Confirmados" },
  { value: "PREPARING", label: "Preparando" },
  { value: "READY", label: "Listos" },
  { value: "DELIVERED", label: "Entregados" },
];

interface Props {
  initialOrders: OrderWithItems[];
  storeId: string;
  whatsapp: string;
}

export function OrdersManager({ initialOrders, storeId, whatsapp }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const { add: toast } = useToast();

  const filtered = filter === "all"
    ? orders
    : orders.filter((o) => o.status === filter);

  const newCount = orders.filter((o) => o.status === "NEW").length;

  // Poll for new orders every 30s
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/orders?storeId=${storeId}`);
      const data = await res.json();
      if (data.success) {
        const newOrders = data.data as OrderWithItems[];
        const prevCount = orders.filter((o) => o.status === "NEW").length;
        const nextCount = newOrders.filter((o) => o.status === "NEW").length;
        if (nextCount > prevCount) {
          toast(`🛍️ ${nextCount - prevCount} nuevo${nextCount - prevCount > 1 ? "s" : ""} pedido${nextCount - prevCount > 1 ? "s" : ""}`, "success");
        }
        setOrders(newOrders);
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [storeId, orders]);

  const advance = (order: OrderWithItems) => {
    const next = STATUS_FLOW[order.status];
    if (!next) return;

    startTransition(async () => {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((os) => os.map((o) => (o.id === order.id ? data.data : o)));
      } else {
        toast("Error al actualizar", "error");
      }
    });
  };

  const openWhatsApp = (order: OrderWithItems) => {
    const msg = `Hola ${order.customerName}! Tu pedido #${order.number} está siendo procesado. Total: ${formatPrice(order.total)}.`;
    window.open(`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-normal text-ink">Pedidos</h1>
        <p className="text-sm text-ink-muted mt-0.5">
          {newCount > 0 ? (
            <span className="text-green font-medium">{newCount} nuevo{newCount > 1 ? "s" : ""} · </span>
          ) : null}
          {orders.length} pedidos en total · Se actualiza cada 30 segundos
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const count = f.value === "all"
            ? orders.length
            : orders.filter((o) => o.status === f.value).length;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filter === f.value
                  ? "bg-ink text-white border-ink"
                  : "bg-white text-ink-soft border-border hover:border-ink"
              }`}
            >
              {f.label}
              {count > 0 && (
                <span className={`ml-1.5 ${filter === f.value ? "opacity-70" : "text-ink-muted"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white border border-border rounded-2xl py-16 text-center text-ink-muted">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm">No hay pedidos en esta categoría</p>
          </div>
        )}

        {filtered.map((order) => {
          const actionLabel = STATUS_ACTION[order.status];
          const isNew = order.status === "NEW";

          return (
            <div
              key={order.id}
              className={`bg-white rounded-2xl border p-5 transition-all ${
                isNew ? "border-green shadow-[0_0_0_1px_#0ABF6E20]" : "border-border"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Order info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-semibold text-ink">{order.customerName}</span>
                    <span className="text-xs text-ink-muted font-mono">#{order.number}</span>
                    <OrderStatusBadge status={order.status} />
                    {isNew && (
                      <span className="text-[10px] bg-green text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                        NUEVO
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {order.items.map((item) => (
                      <span
                        key={item.id}
                        className="text-xs bg-surface px-2 py-0.5 rounded-lg text-ink-soft"
                      >
                        {item.qty}× {item.name}
                      </span>
                    ))}
                  </div>

                  {order.customerNote && (
                    <p className="text-xs text-ink-muted bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                      💬 "{order.customerNote}"
                    </p>
                  )}
                </div>

                {/* Right side */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-bold text-ink">{formatPrice(order.total)}</p>
                  <p className="text-[11px] text-ink-muted">
                    {new Date(order.createdAt).toLocaleString("es-AR", {
                      hour: "2-digit", minute: "2-digit",
                      day: "numeric", month: "short",
                    })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => openWhatsApp(order)}>
                  💬 WhatsApp
                </Button>
                {actionLabel && (
                  <Button
                    size="sm"
                    onClick={() => advance(order)}
                    loading={isPending}
                    className={isNew ? "bg-green hover:bg-green-dark" : ""}
                  >
                    {actionLabel}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
