// src/app/dashboard/orders/page.tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { OrdersManager } from "@/components/admin/orders-manager";

export const metadata = { title: "Pedidos" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await db.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const orders = await db.order.findMany({
    where: { storeId: store.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <OrdersManager
      initialOrders={orders}
      storeId={store.id}
      whatsapp={store.whatsapp}
    />
  );
}
