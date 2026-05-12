// src/app/forgot-password/page.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error ?? "Error al enviar el email");
      }
    });
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-3xl text-ink">
            vend<span className="text-green">ó</span>
          </Link>
        </div>

        <div className="bg-white border border-border rounded-2xl p-8 shadow-card">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">📧</div>
              <h2 className="font-semibold text-ink text-lg">Revisá tu email</h2>
              <p className="text-sm text-ink-muted leading-relaxed">
                Si existe una cuenta con <strong>{email}</strong>, te enviamos un link para restablecer tu contraseña.
              </p>
              <Link href="/login" className="block text-sm text-green font-medium hover:underline mt-4">
                Volver al login
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold text-ink text-base">Olvidé mi contraseña</h2>
                <p className="text-xs text-ink-muted mt-1">Te enviamos un link para crear una nueva.</p>
              </div>
              <Input
                label="Tu email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}
              <Button onClick={handleSubmit} loading={isPending} size="lg" className="w-full">
                Enviar link de recuperación
              </Button>
              <Link href="/login" className="block text-center text-sm text-ink-muted hover:text-ink transition-colors">
                ← Volver al login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
