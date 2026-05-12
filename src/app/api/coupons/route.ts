// src/app/api/coupons/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const createSchema = z.object({
  storeId: z.string(),
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minOrder: z.number().int().min(0).default(0),
  maxUses: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });

  const storeId = new URL(req.url).searchParams.get("storeId");
  if (!storeId) return NextResponse.json({ success: false, error: "storeId requerido" }, { status: 400 });

  const store = await db.store.findFirst({ where: { id: storeId, userId: session.user.id } });
  if (!store) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });

  const coupons = await db.coupon.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: coupons });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const store = await db.store.findFirst({ where: { id: data.storeId, userId: session.user.id } });
    if (!store) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });

    // Verificar código único
    const existing = await db.coupon.findUnique({
      where: { storeId_code: { storeId: data.storeId, code: data.code } },
    });
    if (existing) return NextResponse.json({ success: false, error: "Ese código ya existe" }, { status: 409 });

    const coupon = await db.coupon.create({
      data: {
        storeId: data.storeId,
        code: data.code,
        type: data.type,
        value: data.type === "FIXED" ? Math.round(data.value * 100) : data.value,
        minOrder: Math.round(data.minOrder * 100),
        maxUses: data.maxUses ?? null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
