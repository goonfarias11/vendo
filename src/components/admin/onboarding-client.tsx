// src/components/admin/onboarding-client.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Steps {
  hasProducts: boolean;
  hasCategories: boolean;
  hasWhatsapp: boolean;
  hasDescription: boolean;
  hasLogo: boolean;
}

interface Props {
  store: { id: string; name: string; slug: string };
  steps: Steps;
  completed: number;
  total: number;
}

const STEP_ITEMS = [
  {
    key: "hasWhatsapp" as keyof Steps,
    icon: "💬",
    title: "Configurá tu WhatsApp",
    desc: "El número donde vas a recibir los pedidos de tus clientes.",
    href: "/dashboard/store",
    cta: "Configurar",
  },
  {
    key: "hasDescription" as keyof Steps,
    icon: "📝",
    title: "Describí tu negocio",
    desc: "Contale a tus clientes qué vendés y dónde estás.",
    href: "/dashboard/store",
    cta: "Agregar descripción",
  },
  {
    key: "hasCategories" as keyof Steps,
    icon: "🗂️",
    title: "Creá categorías",
    desc: "Organizá tu catálogo por secciones: Panadería, Bebidas, etc.",
    href: "/dashboard/store",
    cta: "Crear categorías",
  },
  {
    key: "hasProducts" as keyof Steps,
    icon: "📦",
    title: "Agregá tu primer producto",
    desc: "Subí nombre, precio y foto para que tus clientes puedan pedir.",
    href: "/dashboard/products",
    cta: "Agregar producto",
  },
  {
    key: "hasLogo" as keyof Steps,
    icon: "🎨",
    title: "Subí tu logo",
    desc: "Dale identidad visual a tu tienda con tu marca.",
    href: "/dashboard/store",
    cta: "Subir logo",
  },
];

export function OnboardingClient({ store, steps, completed, total }: Props) {
  const router = useRouter();
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="min-h-screen bg-surface font-sans flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-pale text-green-dark text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            🎉 ¡Tu tienda fue creada!
          </div>
          <h1 className="font-serif text-3xl text-ink mb-2">
            Bienvenido, {store.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-ink-muted">
            Completá estos pasos para empezar a recibir pedidos
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white border border-border rounded-2xl p-5 mb-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-ink">Tu progreso</span>
            <span className="text-sm font-bold text-green">{completed}/{total} completados</span>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full bg-green rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-6">
          {STEP_ITEMS.map((item, i) => {
            const done = steps[item.key];
            return (
              <div
                key={item.key}
                className={`bg-white border rounded-2xl p-4 flex items-center gap-4 transition-all ${
                  done ? "border-green/30 opacity-70" : "border-border hover:border-green/50 shadow-card"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                  done ? "bg-green text-white" : "bg-surface"
                }`}>
                  {done ? "✓" : item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${done ? "text-ink-muted line-through" : "text-ink"}`}>
                    {item.title}
                  </p>
                  {!done && (
                    <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{item.desc}</p>
                  )}
                </div>
                {!done && (
                  <Link
                    href={item.href}
                    className="flex-shrink-0 text-xs font-semibold text-white bg-ink px-3 py-1.5 rounded-lg hover:bg-ink/80 transition-colors"
                  >
                    {item.cta}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Store link preview */}
        <div className="bg-white border border-border rounded-2xl p-4 mb-4">
          <p className="text-xs text-ink-muted mb-1.5">Tu link de tienda</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-green flex-1 truncate">
              {process.env.NEXT_PUBLIC_APP_URL}/s/{store.slug}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/s/${store.slug}`)}
              className="text-xs border border-border px-2.5 py-1 rounded-lg hover:border-ink transition-colors"
            >
              Copiar
            </button>
            <Link
              href={`/s/${store.slug}`}
              target="_blank"
              className="text-xs border border-border px-2.5 py-1 rounded-lg hover:border-ink transition-colors"
            >
              Ver →
            </Link>
          </div>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full py-3 text-sm text-ink-muted hover:text-ink transition-colors"
        >
          Ir al panel sin completar →
        </button>
      </div>
    </div>
  );
}
