// src/app/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/admin/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Obtener la primera tienda del usuario
  const store = await db.store.findFirst({
    where: { userId: session.user.id },
    include: { subscription: true },
  });

  if (!store) {
    redirect("/onboarding");
  }

  return (
    <DashboardShell store={store} user={session.user}>
      {children}
    </DashboardShell>
  );
}
