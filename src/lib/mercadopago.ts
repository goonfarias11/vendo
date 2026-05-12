// src/lib/mercadopago.ts
import { MercadoPagoConfig, PreApprovalPlan, PreApproval, Payment } from "mercadopago";

export const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

// ─── Planes de suscripción ───────────────────────────────────────────
// Los precios están en ARS (pesos argentinos)
export const PLANS = {
  STARTER: {
    id: "starter",
    name: "Principiante",
    price: 4900,          // $4.900 ARS/mes
    currency: "ARS",
    features: [
      "Hasta 30 productos",
      "Catálogo con fotos",
      "Pedidos por WhatsApp",
      "Código QR incluido",
      "Soporte por mail",
    ],
    mpPlanId: process.env.MP_PLAN_STARTER_ID ?? null,
  },
  PRO: {
    id: "pro",
    name: "Especialista",
    price: 7900,
    currency: "ARS",
    features: [
      "Productos ilimitados",
      "Cupones de descuento",
      "Múltiples métodos de pago",
      "Dominio personalizado",
      "Estadísticas avanzadas",
      "Soporte prioritario",
    ],
    mpPlanId: process.env.MP_PLAN_PRO_ID ?? null,
    popular: true,
  },
  EXPERT: {
    id: "expert",
    name: "Pro",
    price: 12900,
    currency: "ARS",
    features: [
      "Todo de Especialista",
      "Hasta 5 sucursales",
      "Panel unificado",
      "Integración con sistemas",
      "API disponible",
      "Gerente de cuenta",
    ],
    mpPlanId: process.env.MP_PLAN_EXPERT_ID ?? null,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanByMpId(mpPlanId: string): PlanKey | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.mpPlanId === mpPlanId) return key as PlanKey;
  }
  return null;
}
