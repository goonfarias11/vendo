// src/app/api/coupons/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });

  const coupon = await db.coupon.findFirst({
    where: { id: params.id, store: { userId: session.user.id } },
  });
  if (!coupon) return NextResponse.json({ success: false, error: "No encontrado" }, { status: 404 });

  const body = await req.json();
  const updated = await db.coupon.update({
    where: { id: params.id },
    data: { active: body.active ?? !coupon.active },
  });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });

  const coupon = await db.coupon.findFirst({
    where: { id: params.id, store: { userId: session.user.id } },
  });
  if (!coupon) return NextResponse.json({ success: false, error: "No encontrado" }, { status: 404 });

  await db.coupon.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true, data: { deleted: true } });
}
