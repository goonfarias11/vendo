// src/app/api/subscriptions/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLANS } from "@/lib/mercadopago";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }

  const store = await db.store.findFirst({
    where: { userId: session.user.id },
    include: { subscription: true },
  });

  if (!store?.subscription) {
    return NextResponse.json({ success: true, data: null });
  }

  const sub = store.subscription;
  const planKey = sub.plan as keyof typeof PLANS;
  const planConfig = PLANS[planKey] ?? null;

  const isActive = sub.status === "ACTIVE" || sub.status === "TRIALING";
  const trialDaysLeft = sub.trialEnds
    ? Math.max(0, Math.ceil((new Date(sub.trialEnds).getTime() - Date.now()) / 86_400_000))
    : null;

  return NextResponse.json({
    success: true,
    data: {
      plan: sub.plan,
      status: sub.status,
      isActive,
      trialDaysLeft,
      trialEnds: sub.trialEnds,
      currentPeriodEnd: sub.currentPeriodEnd,
      planConfig,
    },
  });
}
