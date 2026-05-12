// src/app/api/cron/daily/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendTrialEndingEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  // Verificar secret
  const secret = new URL(req.url).searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = { trialWarnings: 0, trialsExpired: 0, errors: 0 };

  // ── 1. Avisar trials que vencen en 3 días ──────────────────────────
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in4Days = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

  const expiringTrials = await db.subscription.findMany({
    where: {
      status: "TRIALING",
      trialEnds: { gte: in3Days, lt: in4Days },
    },
    include: { store: { include: { user: true } } },
  });

  for (const sub of expiringTrials) {
    try {
      const user = sub.store.user;
      if (user.email) {
        await sendTrialEndingEmail(user.email, user.name ?? "Usuario", 3);
        results.trialWarnings++;
      }
    } catch (err) {
      console.error(`[Cron] Error enviando aviso a store ${sub.storeId}:`, err);
      results.errors++;
    }
  }

  // ── 2. Expirar trials vencidos ──────────────────────────────────────
  const expired = await db.subscription.updateMany({
    where: {
      status: "TRIALING",
      trialEnds: { lt: now },
    },
    data: { status: "CANCELLED" },
  });
  results.trialsExpired = expired.count;

  // ── 3. Desactivar tiendas con sub cancelada hace más de 7 días ──────
  const grace = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const cancelledSubs = await db.subscription.findMany({
    where: {
      status: "CANCELLED",
      updatedAt: { lt: grace },
    },
    select: { storeId: true },
  });

  if (cancelledSubs.length > 0) {
    await db.store.updateMany({
      where: { id: { in: cancelledSubs.map(s => s.storeId) } },
      data: { active: false },
    });
  }

  console.log("[Cron daily]", results);
  return NextResponse.json({ ok: true, results, timestamp: now.toISOString() });
}
