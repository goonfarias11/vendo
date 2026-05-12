// src/app/reset-password/page.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError("");
    if (password !== confirm) { setError("Las contraseñas no coinciden"); return; }
    if (password.length < 6) { setError("Mínimo 6 caracteres"); return; }

    startTransition(async () => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setError(data.error ?? "Error al restablecer");
      }
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4 font-sans">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="font-semibold text-ink mb-2">Link inválido</h2>
          <p className="text-sm text-ink-muted mb-4">Este link no es válido o ya fue usado.</p>
          <Link href="/forgot-password" className="text-sm text-green font-medium hover:underline">
            Solicitar nuevo link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-3xl text-ink">
            vend<span className="text-green">ó</span>
          </Link>
        </div>
        <div className="bg-white border border-border rounded-2xl p-8 shadow-card">
          {done ? (
            <div className="text-center space-y-3">
              <div className="text-5xl">✅</div>
              <h2 className="font-semibold text-ink">¡Contraseña actualizada!</h2>
              <p className="text-sm text-ink-muted">Redirigiendo al login...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold text-ink text-base">Nueva contraseña</h2>
                <p className="text-xs text-ink-muted mt-1">Elegí una contraseña segura.</p>
              </div>
              <Input label="Nueva contraseña" type="password" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
              <Input label="Confirmar contraseña" type="password" value={confirm}
                onChange={e => setConfirm(e.target.value)} placeholder="Repetí la contraseña"
                onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-lg">{error}</div>
              )}
              <Button onClick={handleSubmit} loading={isPending} size="lg" className="w-full">
                Guardar nueva contraseña
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
