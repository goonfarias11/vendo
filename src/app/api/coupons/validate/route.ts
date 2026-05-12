// src/app/api/coupons/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

const schema = z.object({
  storeId: z.string(),
  code: z.string(),
  cartTotal: z.number().int().positive(), // en centavos
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId, code, cartTotal } = schema.parse(body);

    const coupon = await db.coupon.findUnique({
      where: {
        storeId_code: { storeId, code: code.toUpperCase() },
        active: true,
      },
    });

    if (!coupon) {
      return NextResponse.json({ success: false, error: "Cupón inválido o inexistente" }, { status: 404 });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: "El cupón está vencido" }, { status: 400 });
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ success: false, error: "El cupón ya alcanzó su límite de usos" }, { status: 400 });
    }

    if (cartTotal < coupon.minOrder) {
      return NextResponse.json({
        success: false,
        error: `El cupón requiere un mínimo de ${formatPrice(coupon.minOrder)}`,
      }, { status: 400 });
    }

    // Calcular descuento
    let discount = 0;
    if (coupon.type === "PERCENT") {
      discount = Math.round((cartTotal * coupon.value) / 100);
    } else {
      discount = Math.min(coupon.value, cartTotal); // no puede ser mayor al total
    }

    const finalTotal = cartTotal - discount;

    return NextResponse.json({
      success: true,
      data: {
        couponId: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
        finalTotal,
        description:
          coupon.type === "PERCENT"
            ? `${coupon.value}% de descuento`
            : `${formatPrice(coupon.value)} de descuento`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
