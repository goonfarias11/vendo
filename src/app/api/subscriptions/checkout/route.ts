// src/app/api/subscriptions/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mp, PLANS, type PlanKey } from "@/lib/mercadopago";
import { PreApproval } from "mercadopago";

const schema = z.object({
  plan: z.enum(["STARTER", "PRO", "EXPERT"]),
  storeId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { plan, storeId } = schema.parse(body);

    // Verificar propiedad de la tienda
    const store = await db.store.findFirst({
      where: { id: storeId, userId: session.user.id },
      include: { subscription: true },
    });
    if (!store) {
      return NextResponse.json({ success: false, error: "Tienda no encontrada" }, { status: 404 });
    }

    const planConfig = PLANS[plan];
    if (!planConfig.mpPlanId) {
      return NextResponse.json(
        { success: false, error: "Plan no configurado en Mercado Pago" },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    // Crear suscripción pre-aprobada en MP
    const preApproval = new PreApproval(mp);
    const result = await preApproval.create({
      body: {
        preapproval_plan_id: planConfig.mpPlanId,
        payer_email: session.user.email!,
        card_token_id: undefined, // MP lo pide en el flujo de pago
        back_url: `${appUrl}/dashboard/billing?status=success`,
        external_reference: JSON.stringify({ storeId, plan, userId: session.user.id }),
      },
    });

    if (!result.init_point) {
      return NextResponse.json(
        { success: false, error: "Error al crear checkout con Mercado Pago" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { checkoutUrl: result.init_point, subscriptionId: result.id },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    console.error("[SUBSCRIPTIONS CHECKOUT]", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
