// src/app/dashboard/store/page.tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";

export const metadata = { title: "Mi tienda" };

export default async function StoreSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await db.store.findFirst({
    where: { userId: session.user.id },
    include: {
      categories: { orderBy: { position: "asc" } },
      subscription: true,
    },
  });
  if (!store) redirect("/onboarding");

  return <StoreSettingsForm store={store} />;
}
