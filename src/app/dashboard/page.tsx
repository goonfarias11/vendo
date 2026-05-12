// src/app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardHome } from "@/components/admin/dashboard-home";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await db.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  // Stats del día
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [ordersToday, allOrders, products, recentOrders] = await Promise.all([
    db.order.findMany({
      where: { storeId: store.id, createdAt: { gte: startOfDay } },
      select: { total: true, status: true },
    }),
    db.order.count({ where: { storeId: store.id } }),
    db.product.count({ where: { storeId: store.id } }),
    db.order.findMany({
      where: { storeId: store.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Producto más pedido
  const itemCounts = await db.orderItem.groupBy({
    by: ["name"],
    where: { order: { storeId: store.id } },
    _sum: { qty: true },
    orderBy: { _sum: { qty: "desc" } },
    take: 1,
  });

  const revenueToday = ordersToday.reduce((s, o) => s + o.total, 0);
  const newOrders = ordersToday.filter((o) => o.status === "NEW").length;

  const stats = {
    ordersToday: ordersToday.length,
    revenueToday: formatPrice(revenueToday),
    newOrders,
    topProduct: itemCounts[0]?.name ?? null,
    totalProducts: products,
    totalOrders: allOrders,
  };

  return <DashboardHome stats={stats} recentOrders={recentOrders} store={store} />;
}
