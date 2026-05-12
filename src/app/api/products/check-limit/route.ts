// src/app/api/products/check-limit/route.ts
// Endpoint para verificar si el store puede agregar más productos
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-gate";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");

  if (!storeId) {
    return NextResponse.json({ success: false, error: "storeId requerido" }, { status: 400 });
  }

  const store = await db.store.findFirst({
    where: { id: storeId, userId: session.user.id },
  });
  if (!store) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
  }

  const [limits, currentCount] = await Promise.all([
    getPlanLimits(storeId),
    db.product.count({ where: { storeId } }),
  ]);

  const canAdd = currentCount < limits.maxProducts;

  return NextResponse.json({
    success: true,
    data: {
      canAdd,
      currentCount,
      maxProducts: limits.maxProducts === Infinity ? null : limits.maxProducts,
      upgradeRequired: !canAdd,
    },
  });
}
