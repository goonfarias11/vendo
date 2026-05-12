// src/components/ui/upgrade-prompt.tsx
"use client";

import Link from "next/link";

interface Props {
  feature?: string;
  title?: string;
  description?: string;
  compact?: boolean;
}

export function UpgradePrompt({
  title = "Necesitás un plan superior",
  description = "Esta función no está disponible en tu plan actual.",
  compact = false,
}: Props) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
        <span className="text-xl flex-shrink-0">⚡</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-amber-800">{title}</p>
          <p className="text-xs text-amber-700 truncate">{description}</p>
        </div>
        <Link
          href="/dashboard/billing"
          className="flex-shrink-0 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors"
        >
          Mejorar plan
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-8 text-center">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
        ⚡
      </div>
      <h3 className="text-base font-semibold text-ink mb-2">{title}</h3>
      <p className="text-sm text-ink-muted mb-6 leading-relaxed max-w-xs mx-auto">
        {description}
      </p>
      <Link
        href="/dashboard/billing"
        className="inline-flex items-center gap-2 bg-ink text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-ink/90 transition-colors"
      >
        Ver planes disponibles →
      </Link>
    </div>
  );
}
