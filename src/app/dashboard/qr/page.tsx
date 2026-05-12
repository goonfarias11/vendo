// src/app/dashboard/qr/page.tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { QRClient } from "@/components/admin/qr-client";

export const metadata = { title: "Código QR" };

export default async function QRPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await db.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/s/${store.slug}`;

  return <QRClient storeName={store.name} storeUrl={storeUrl} primaryColor={store.primaryColor} />;
}
