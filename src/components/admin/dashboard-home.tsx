// src/components/admin/dashboard-home.tsx
"use client";

import Link from "next/link";
import type { Order, Store } from "@prisma/client";
import type { OrderWithItems } from "@/types";
import { formatPrice, buildWhatsAppUrl, buildWhatsAppMessage } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/badge";

interface Stats {
  ordersToday: number;
  revenueToday: string;
  newOrders: number;
  topProduct: string | null;
  totalProducts: number;
  totalOrders: number;
}

interface Props {
  stats: Stats;
  recentOrders: OrderWithItems[];
  store: Store;
}

function StatCard({
  emoji, label, value, sub, highlight,
}: {
  emoji: string; label: string; value: string | number; sub: string; highlight?: boolean;
}) {
  return (
    <div className={`bg-white border rounded-2xl p-5 ${highlight ? "border-green" : "border-border"}`}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs text-ink-muted font-medium">{label}</span>
        <span className="text-xl">{emoji}</span>
      </div>
      <div className={`text-[28px] font-serif mb-1 ${highlight ? "text-green" : "text-ink"}`}>
        {value}
      </div>
      <div className="text-xs text-ink-muted">{sub}</div>
    </div>
  );
}

export function DashboardHome({ stats, recentOrders, store }: Props) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-normal text-ink">
          Buenos días, {store.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })} · Tu tienda está activa
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          emoji="💬" label="Pedidos hoy"
          value={stats.ordersToday} sub={`${stats.newOrders} sin confirmar`}
          highlight={stats.newOrders > 0}
        />
        <StatCard emoji="💰" label="Ventas hoy" value={stats.revenueToday} sub="sin comisiones" />
        <StatCard emoji="📦" label="Productos" value={stats.totalProducts} sub="en tu catálogo" />
        <StatCard emoji="⭐" label="Más pedido" value={stats.topProduct ?? "—"} sub="este mes" />
      </div>

      {/* Recent orders + store card */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-5">
        {/* Orders */}
        <div className="bg-white border border-border rounded-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-ink">Últimos pedidos</h2>
            <Link href="/dashboard/orders" className="text-xs text-green font-medium hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-sm text-ink-muted">
                <div className="text-3xl mb-3">📭</div>
                Todavía no recibiste pedidos
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 px-6 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">{order.customerName}</p>
                    <p className="text-xs text-ink-muted truncate">
                      {order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-ink">{formatPrice(order.total)}</p>
                    <p className="text-[11px] text-ink-muted">
                      {new Date(order.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Store card */}
        <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-ink">Tu tienda online</h2>

          <div className="bg-surface rounded-xl p-3 text-center">
            <p className="text-[11px] text-ink-muted mb-1.5">Link de tu tienda</p>
            <p className="text-sm font-medium text-green">
              vendó.app/s/{store.slug}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/s/${store.slug}`)}
              className="flex-1 py-2 text-xs border border-border rounded-lg hover:border-ink transition-colors font-medium"
            >
              📋 Copiar link
            </button>
            <Link
              href={`/s/${store.slug}`}
              target="_blank"
              className="flex-1 py-2 text-xs border border-border rounded-lg hover:border-ink transition-colors font-medium text-center"
            >
              👁️ Ver tienda
            </Link>
          </div>

          <div className="flex items-center gap-3 bg-green-pale rounded-xl p-3">
            <span className="text-lg">✅</span>
            <div>
              <p className="text-xs font-semibold text-green-dark">Tienda activa</p>
              <p className="text-[11px] text-green-dark/70">Tus clientes pueden hacer pedidos</p>
            </div>
          </div>

          <div className="pt-1 border-t border-border">
            <p className="text-[11px] text-ink-muted mb-2">Compartir tienda</p>
            <div className="flex gap-2">
              {["Instagram", "WhatsApp", "Facebook"].map((platform) => (
                <span
                  key={platform}
                  className="text-[11px] bg-surface px-2 py-1 rounded-lg text-ink-muted"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
