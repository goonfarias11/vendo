// src/app/api/subscriptions/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPlanByMpId, mp } from "@/lib/mercadopago";
import { PreApproval } from "mercadopago";
import crypto from "crypto";

// Verificar firma del webhook de MP
function verifySignature(req: NextRequest, body: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // Skip en dev

  const xSignature = req.headers.get("x-signature") ?? "";
  const xRequestId = req.headers.get("x-request-id") ?? "";
  const urlParams = new URL(req.url).searchParams;
  const dataId = urlParams.get("data.id") ?? "";

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${xSignature.split(",").find(p => p.startsWith("ts="))?.split("=")[1] ?? ""}`;
  const hmac = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  const signature = xSignature.split(",").find(p => p.startsWith("v1="))?.split("=")[1] ?? "";

  return hmac === signature;
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  if (!verifySignature(req, body)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, data } = event;

  try {
    // ── Suscripción creada / actualizada ──────────────────────────────
    if (type === "subscription_preapproval") {
      const preApproval = new PreApproval(mp);
      const subscription = await preApproval.get({ id: data.id });

      const externalRef = subscription.external_reference
        ? JSON.parse(subscription.external_reference)
        : null;

      if (!externalRef?.storeId) {
        console.warn("[WEBHOOK] No storeId in external_reference");
        return NextResponse.json({ received: true });
      }

      const { storeId, plan } = externalRef;

      const statusMap: Record<string, string> = {
        authorized: "ACTIVE",
        paused: "PAST_DUE",
        cancelled: "CANCELLED",
        pending: "TRIALING",
      };

      const newStatus = statusMap[subscription.status ?? ""] ?? "PAST_DUE";

      await db.subscription.upsert({
        where: { storeId },
        create: {
          storeId,
          plan: plan ?? "STARTER",
          status: newStatus as any,
          mpSubscriptionId: subscription.id,
          currentPeriodEnd: subscription.next_payment_date
            ? new Date(subscription.next_payment_date)
            : null,
        },
        update: {
          plan: plan ?? "STARTER",
          status: newStatus as any,
          mpSubscriptionId: subscription.id,
          currentPeriodEnd: subscription.next_payment_date
            ? new Date(subscription.next_payment_date)
            : null,
        },
      });

      console.log(`[WEBHOOK] Subscription ${subscription.id} → ${newStatus} for store ${storeId}`);
    }

    // ── Pago recibido ─────────────────────────────────────────────────
    if (type === "payment") {
      // Opcional: loguear pagos para auditoría
      console.log(`[WEBHOOK] Payment received: ${data.id}`);
    }
  } catch (error) {
    console.error("[WEBHOOK] Error processing event:", error);
    // Siempre devolver 200 para que MP no reintente indefinidamente
  }

  return NextResponse.json({ received: true });
}
