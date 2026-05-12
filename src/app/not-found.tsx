// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 font-sans">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="font-serif text-3xl text-ink mb-3">Página no encontrada</h1>
        <p className="text-sm text-ink-muted mb-8 leading-relaxed">
          La página que buscás no existe o fue movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-colors"
          >
            Ir al inicio
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 border border-border text-ink rounded-xl text-sm font-medium hover:border-ink transition-colors"
          >
            Mi panel
          </Link>
        </div>
      </div>
    </div>
  );
}
