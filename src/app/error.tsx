// src/app/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 font-sans">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-5">⚠️</div>
        <h2 className="font-serif text-2xl text-ink mb-2">Algo salió mal</h2>
        <p className="text-sm text-ink-muted mb-6 leading-relaxed">
          Ocurrió un error inesperado. Si el problema persiste, contactá a soporte.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-ink-muted mb-4 bg-surface px-3 py-2 rounded-lg">
            ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Reintentar</Button>
          <Button variant="secondary" onClick={() => window.location.href = "/dashboard"}>
            Ir al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
