// src/components/admin/billing-client.tsx
"use client";

import { useState, useTransition } from "react";
import { PLANS, type PlanKey } from "@/lib/mercadopago";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface Subscription {
  plan: string;
  status: string;
  isActive: boolean;
  trialDaysLeft: number | null;
  trialEnds: string | null;
  currentPeriodEnd: string | null;
  mpSubscriptionId: string | null;
}

interface Props {
  storeId: string;
  subscription: Subscription | null;
  plans: typeof PLANS;
  justSubscribed: boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  TRIALING: { label: "Trial activo", color: "#07944F", bg: "#E8FAF2" },
  ACTIVE: { label: "Activo", color: "#07944F", bg: "#E8FAF2" },
  PAST_DUE: { label: "Pago pendiente", color: "#92400E", bg: "#FEF9C3" },
  CANCELLED: { label: "Cancelado", color: "#B91C1C", bg: "#FEF2F2" },
};

export function BillingClient({ storeId, subscription, plans, justSubscribed }: Props) {
  const [isPending, startTransition] = useTransition();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { add: toast } = useToast();

  const currentPlan = subscription?.plan ?? "FREE";
  const statusConfig = STATUS_LABELS[subscription?.status ?? ""] ?? null;

  const handleSubscribe = (planKey: PlanKey) => {
    setLoadingPlan(planKey);
    startTransition(async () => {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, storeId }),
      });
      const data = await res.json();
      setLoadingPlan(null);

      if (!data.success) {
        toast(data.error ?? "Error al iniciar checkout", "error");
        return;
      }

      // Redirigir al checkout de Mercado Pago
      window.location.href = data.data.checkoutUrl;
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-normal text-ink">Plan y facturación</h1>
        <p className="text-sm text-ink-muted mt-0.5">
          Administrá tu suscripción y método de pago
        </p>
      </div>

      {/* Success banner */}
      {justSubscribed && (
        <div className="bg-green-pale border border-green rounded-2xl px-6 py-4 flex items-center gap-4">
          <span className="text-3xl">🎉</span>
          <div>
            <p className="font-semibold text-green-dark">¡Suscripción activada!</p>
            <p className="text-sm text-green-dark/80">Tu plan ya está activo. Gracias por confiar en Vendó.</p>
          </div>
        </div>
      )}

      {/* Current plan status */}
      {subscription && (
        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-ink mb-4">Tu plan actual</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-ink rounded-xl flex items-center justify-center text-white text-xl">
                {currentPlan === "EXPERT" ? "🚀" : currentPlan === "PRO" ? "⭐" : "🌱"}
              </div>
              <div>
                <p className="font-semibold text-ink text-lg">
                  {plans[currentPlan as PlanKey]?.name ?? "Trial gratuito"}
                </p>
                {statusConfig && (
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ background: statusConfig.bg, color: statusConfig.color }}
                  >
                    {statusConfig.label}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              {subscription.status === "TRIALING" && subscription.trialDaysLeft !== null && (
                <div>
                  <p className="text-2xl font-serif text-ink">{subscription.trialDaysLeft}</p>
                  <p className="text-xs text-ink-muted">días de trial restantes</p>
                </div>
              )}
              {subscription.status === "ACTIVE" && subscription.currentPeriodEnd && (
                <div>
                  <p className="text-sm font-medium text-ink">
                    Próximo cobro:{" "}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString("es-AR", {
                      day: "numeric", month: "long",
                    })}
                  </p>
                  <p className="text-xs text-ink-muted">
                    ${plans[currentPlan as PlanKey]?.price.toLocaleString("es-AR")} / mes
                  </p>
                </div>
              )}
            </div>
          </div>

          {subscription.status === "TRIALING" && (
            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-800 font-medium">
                ⏰ Tu trial termina el{" "}
                {subscription.trialEnds
                  ? new Date(subscription.trialEnds).toLocaleDateString("es-AR", {
                      day: "numeric", month: "long", year: "numeric",
                    })
                  : "—"}
                . Suscribite para no perder el acceso.
              </p>
            </div>
          )}

          {subscription.status === "PAST_DUE" && (
            <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-xs text-red-700 font-medium">
                ⚠️ Tu pago está pendiente. Actualizá tu método de pago para mantener el acceso.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Plan cards */}
      <div>
        <h2 className="text-sm font-semibold text-ink mb-4">
          {subscription?.status === "ACTIVE" ? "Cambiar plan" : "Elegí tu plan"}
        </h2>

        <div className="grid grid-cols-3 gap-4">
          {(Object.entries(plans) as [PlanKey, typeof plans[PlanKey]][]).map(([key, plan]) => {
            const isCurrent = currentPlan === key && subscription?.status === "ACTIVE";
            const isPopular = "popular" in plan && plan.popular;

            return (
              <div
                key={key}
                className={`relative bg-white rounded-2xl border p-6 transition-all ${
                  isCurrent
                    ? "border-green shadow-[0_0_0_1px_#0ABF6E]"
                    : isPopular
                    ? "border-ink"
                    : "border-border hover:border-ink/30"
                }`}
              >
                {/* Badges */}
                {isPopular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-ink text-white text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Más elegido
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green text-white text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Plan actual
                  </div>
                )}

                {/* Plan info */}
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-1">
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="font-serif text-3xl text-ink">
                    ${plan.price.toLocaleString("es-AR")}
                  </span>
                  <span className="text-xs text-ink-muted">/ mes</span>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-ink-soft">
                      <span className="text-green mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div className="w-full py-2 rounded-xl bg-green-pale text-green-dark text-sm font-semibold text-center">
                    Plan activo ✓
                  </div>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(key)}
                    loading={isPending && loadingPlan === key}
                    disabled={isPending}
                    variant={isPopular ? "primary" : "secondary"}
                    size="md"
                    className="w-full"
                  >
                    {subscription?.isActive ? "Cambiar a este plan" : "Suscribirme"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-ink-muted mt-4">
          Todos los planes incluyen 14 días de prueba gratuita · Sin tarjeta para empezar · Cancelás cuando querés
        </p>
      </div>

      {/* FAQ */}
      <div className="bg-white border border-border rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-ink">Preguntas frecuentes</h2>
        {[
          {
            q: "¿Cómo funciona el cobro?",
            a: "Mercado Pago cobra automáticamente cada mes a tu tarjeta de crédito o débito. Recibís un comprobante por email.",
          },
          {
            q: "¿Puedo cambiar de plan?",
            a: "Sí, en cualquier momento. Si subís de plan, el cambio es inmediato. Si bajás, aplica al siguiente ciclo.",
          },
          {
            q: "¿Qué pasa si cancelo?",
            a: "Podés cancelar cuando querés desde Mercado Pago. Tu tienda sigue activa hasta que vence el período ya pagado.",
          },
          {
            q: "¿Cobran comisión por venta?",
            a: "No. Vendó cobra solo la suscripción mensual. No tomamos ningún porcentaje de tus ventas.",
          },
        ].map(({ q, a }) => (
          <div key={q}>
            <p className="text-sm font-medium text-ink mb-1">{q}</p>
            <p className="text-sm text-ink-muted leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
