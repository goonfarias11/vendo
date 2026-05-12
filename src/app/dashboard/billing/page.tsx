// src/app/dashboard/billing/page.tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BillingClient } from "@/components/admin/billing-client";
import { PLANS } from "@/lib/mercadopago";

export const metadata = { title: "Plan y facturación" };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await db.store.findFirst({
    where: { userId: session.user.id },
    include: { subscription: true },
  });
  if (!store) redirect("/onboarding");

  const sub = store.subscription;
  const isActive = sub?.status === "ACTIVE" || sub?.status === "TRIALING";
  const trialDaysLeft = sub?.trialEnds
    ? Math.max(0, Math.ceil((new Date(sub.trialEnds).getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <BillingClient
      storeId={store.id}
      subscription={sub ? {
        plan: sub.plan,
        status: sub.status,
        isActive,
        trialDaysLeft,
        trialEnds: sub.trialEnds?.toISOString() ?? null,
        currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
        mpSubscriptionId: sub.mpSubscriptionId,
      } : null}
      plans={PLANS}
      justSubscribed={searchParams.status === "success"}
    />
  );
}
