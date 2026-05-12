// src/app/admin/page.tsx
// Panel de super-admin — solo accesible con ADMIN_SECRET en la URL
// Ej: /admin?secret=tu-secreto

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

interface Props {
  searchParams: { secret?: string };
}

export default async function SuperAdminPage({ searchParams }: Props) {
  if (searchParams.secret !== process.env.ADMIN_SECRET) {
    redirect("/");
  }

  const [users, stores, orders, subscriptions] = await Promise.all([
    db.user.count(),
    db.store.count(),
    db.order.count(),
    db.subscription.groupBy({ by: ["status"], _count: true }),
  ]);

  const revenueResult = await db.order.aggregate({ _sum: { total: true } });
  const totalRevenue = revenueResult._sum.total ?? 0;

  const recentStores = await db.store.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      user: { select: { email: true, name: true } },
      subscription: true,
      _count: { select: { orders: true, products: true } },
    },
  });

  const subsMap = Object.fromEntries(
    subscriptions.map(s => [s.status, s._count])
  );

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.25rem" }}>
        🔐 Super Admin — Vendó
      </h1>
      <p style={{ color: "#888", marginBottom: "2rem", fontSize: "0.875rem" }}>
        Panel interno · No compartir esta URL
      </p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Usuarios", value: users, icon: "👤" },
          { label: "Tiendas", value: stores, icon: "🏪" },
          { label: "Pedidos totales", value: orders, icon: "📦" },
          { label: "GMV total", value: formatPrice(totalRevenue), icon: "💰" },
          { label: "Subs activas", value: subsMap["ACTIVE"] ?? 0, icon: "✅" },
        ].map(stat => (
          <div key={stat.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0e1117" }}>{stat.value}</div>
            <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.25rem" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Subscriptions breakdown */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Estado de suscripciones</h2>
        <div style={{ display: "flex", gap: "2rem" }}>
          {[
            { status: "ACTIVE", label: "Activas", color: "#0ABF6E" },
            { status: "TRIALING", label: "En trial", color: "#3B82F6" },
            { status: "PAST_DUE", label: "Pago pendiente", color: "#F59E0B" },
            { status: "CANCELLED", label: "Canceladas", color: "#EF4444" },
          ].map(s => (
            <div key={s.status}>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: s.color }}>{subsMap[s.status] ?? 0}</div>
              <div style={{ fontSize: "0.75rem", color: "#888" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent stores */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Últimas tiendas</h2>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr>
              {["Tienda", "Dueño", "Plan", "Pedidos", "Productos", "Creada"].map(h => (
                <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentStores.map((store, i) => {
              const sub = store.subscription;
              const subColors: Record<string, string> = {
                ACTIVE: "#0ABF6E", TRIALING: "#3B82F6", PAST_DUE: "#F59E0B", CANCELLED: "#EF4444",
              };
              return (
                <tr key={store.id} style={{ borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    <div style={{ fontWeight: 600, color: "#0e1117" }}>{store.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#888" }}>/{store.slug}</div>
                  </td>
                  <td style={{ padding: "0.875rem 1rem", color: "#444" }}>
                    <div>{store.user.name ?? "—"}</div>
                    <div style={{ fontSize: "0.75rem", color: "#888" }}>{store.user.email}</div>
                  </td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    {sub ? (
                      <span style={{
                        fontSize: "0.7rem", fontWeight: 600,
                        color: subColors[sub.status] ?? "#888",
                        background: `${subColors[sub.status]}20`,
                        padding: "2px 8px", borderRadius: 100
                      }}>
                        {sub.plan} · {sub.status}
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "#888" }}>Sin plan</span>
                    )}
                  </td>
                  <td style={{ padding: "0.875rem 1rem", color: "#444" }}>{store._count.orders}</td>
                  <td style={{ padding: "0.875rem 1rem", color: "#444" }}>{store._count.products}</td>
                  <td style={{ padding: "0.875rem 1rem", color: "#888", fontSize: "0.75rem" }}>
                    {new Date(store.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
