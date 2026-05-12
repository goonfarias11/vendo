// src/app/store/slug/not-found.tsx
import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 font-sans">
      <div className="text-center max-w-xs">
        <div className="w-20 h-20 bg-white border border-border rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-card">
          🏪
        </div>
        <h1 className="font-serif text-2xl text-ink mb-2">Tienda no encontrada</h1>
        <p className="text-sm text-ink-muted mb-6 leading-relaxed">
          Esta tienda no existe o fue desactivada por su dueño.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-white rounded-xl text-sm font-medium hover:bg-ink/90 transition-colors"
        >
          Crear mi propia tienda →
        </Link>
      </div>
    </div>
  );
}
