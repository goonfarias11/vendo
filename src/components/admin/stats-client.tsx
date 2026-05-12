// src/components/admin/stats-client.tsx
"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";

interface DailyData {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  name: string;
  qty: number;
  orders: number;
}

interface Summary {
  totalRevenue: string;
  totalOrders: number;
  avgOrder: string;
  period: string;
}

interface Props {
  dailyData: DailyData[];
  topProducts: TopProduct[];
  summary: Summary;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <p className="text-xs text-ink-muted font-medium mb-2">{label}</p>
      <p className="text-[28px] font-serif text-ink">{value}</p>
      {sub && <p className="text-xs text-ink-muted mt-1">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2 shadow-float text-xs">
      <p className="font-medium text-ink mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === "revenue"
            ? `Ventas: $${(p.value / 100).toLocaleString("es-AR")}`
            : `Pedidos: ${p.value}`}
        </p>
      ))}
    </div>
  );
};

export function StatsClient({ dailyData, topProducts, summary }: Props) {
  const maxQty = Math.max(...topProducts.map((p) => p.qty), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-normal text-ink">Estadísticas</h1>
        <p className="text-sm text-ink-muted mt-0.5">{summary.period}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Ventas totales" value={summary.totalRevenue} sub="sin comisiones" />
        <StatCard label="Pedidos" value={summary.totalOrders} sub="en 30 días" />
        <StatCard label="Ticket promedio" value={summary.avgOrder} sub="por pedido" />
      </div>

      {/* Revenue chart */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-ink mb-5">Ventas diarias</h2>
        {dailyData.every((d) => d.revenue === 0) ? (
          <div className="h-48 flex items-center justify-center text-sm text-ink-muted">
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              Todavía no hay datos de ventas
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ABF6E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0ABF6E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#8A9099" }}
                tickLine={false}
                axisLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#8A9099" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 100).toLocaleString("es-AR")}`}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0ABF6E"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4">
        {/* Orders chart */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-ink mb-5">Pedidos por día</h2>
          {dailyData.every((d) => d.orders === 0) ? (
            <div className="h-40 flex items-center justify-center text-sm text-ink-muted text-center">
              <div>
                <div className="text-3xl mb-2">📭</div>
                Sin pedidos aún
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dailyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8A9099" }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: "#8A9099" }} tickLine={false} axisLine={false} allowDecimals={false} width={24} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" fill="#0ABF6E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top products */}
        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-ink mb-5">Productos más pedidos</h2>
          {topProducts.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-ink-muted text-center">
              <div>
                <div className="text-3xl mb-2">🏆</div>
                Sin datos aún
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-ink-muted w-4">{i + 1}</span>
                      <span className="text-sm text-ink truncate max-w-[160px]">{p.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-ink-soft flex-shrink-0">
                      {p.qty} uds
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green transition-all"
                      style={{ width: `${(p.qty / maxQty) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
