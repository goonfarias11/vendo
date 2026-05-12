// src/app/api/analytics/view/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { storeId, source } = await req.json();
    if (!storeId) return NextResponse.json({ ok: false }, { status: 400 });

    // Registrar visita de forma asíncrona (no bloqueante)
    await db.storeView.create({
      data: { storeId, source: source ?? "direct" },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// GET /api/analytics/view?storeId=xxx&days=30
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  const days = parseInt(searchParams.get("days") ?? "30");

  if (!storeId) return NextResponse.json({ success: false, error: "storeId requerido" }, { status: 400 });

  const since = new Date();
  since.setDate(since.getDate() - days);

  const views = await db.storeView.findMany({
    where: { storeId, createdAt: { gte: since } },
    select: { source: true, createdAt: true },
  });

  // Agrupar por día
  const byDay: Record<string, number> = {};
  for (const v of views) {
    const key = v.createdAt.toISOString().slice(0, 10);
    byDay[key] = (byDay[key] ?? 0) + 1;
  }

  // Agrupar por fuente
  const bySource: Record<string, number> = {};
  for (const v of views) {
    const src = v.source ?? "direct";
    bySource[src] = (bySource[src] ?? 0) + 1;
  }

  return NextResponse.json({
    success: true,
    data: { total: views.length, byDay, bySource },
  });
}
