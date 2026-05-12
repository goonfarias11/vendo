// src/app/dashboard/stats/page.tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { StatsClient } from "@/components/admin/stats-client";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Estadísticas" };

export default async function StatsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await db.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  // Last 30 days of orders
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const orders = await db.order.findMany({
    where: { storeId: store.id, createdAt: { gte: since } },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  // Daily revenue for chart
  const dailyMap: Record<string, { revenue: number; orders: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = { revenue: 0, orders: 0 };
  }
  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    if (dailyMap[key]) {
      dailyMap[key].revenue += order.total;
      dailyMap[key].orders += 1;
    }
  }

  const dailyData = Object.entries(dailyMap).map(([date, v]) => ({
    date,
    revenue: v.revenue,
    orders: v.orders,
    label: new Date(date + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
  }));

  // Top products
  const itemCounts = await db.orderItem.groupBy({
    by: ["name"],
    where: { order: { storeId: store.id, createdAt: { gte: since } } },
    _sum: { qty: true },
    _count: true,
    orderBy: { _sum: { qty: "desc" } },
    take: 5,
  });

  const topProducts = itemCounts.map((i) => ({
    name: i.name,
    qty: i._sum.qty ?? 0,
    orders: i._count,
  }));

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <StatsClient
      dailyData={dailyData}
      topProducts={topProducts}
      summary={{
        totalRevenue: formatPrice(totalRevenue),
        totalOrders,
        avgOrder: formatPrice(avgOrder),
        period: "Últimos 30 días",
      }}
    />
  );
}
