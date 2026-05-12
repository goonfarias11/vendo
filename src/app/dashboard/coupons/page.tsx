// src/app/dashboard/coupons/page.tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CouponsManager } from "@/components/admin/coupons-manager";

export const metadata = { title: "Cupones" };

export default async function CouponsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await db.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const coupons = await db.coupon.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
  });

  return <CouponsManager initialCoupons={coupons} storeId={store.id} />;
}
