// src/app/register/page.tsx
"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toSlug } from "@/lib/utils";

const STEPS = ["Tu cuenta", "Tu tienda", "¡Listo!"];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    storeName: "", whatsapp: "", category: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validateStep0 = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Tu nombre es obligatorio";
    if (!form.email.includes("@")) errs.email = "Email inválido";
    if (form.password.length < 6) errs.password = "Mínimo 6 caracteres";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.storeName.trim()) errs.storeName = "El nombre de la tienda es obligatorio";
    if (form.whatsapp.replace(/\D/g, "").length < 10) errs.whatsapp = "WhatsApp inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && validateStep0()) setStep(1);
  };

  const handleSubmit = () => {
    if (!validateStep1()) return;
    startTransition(async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        setErrors({ general: data.error ?? "Error al registrarse" });
        return;
      }
      // Auto-login after register
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      setStep(2);
      setTimeout(() => router.push("/dashboard"), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-3xl text-ink">
            vend<span className="text-green">ó</span>
          </Link>
          <p className="text-sm text-ink-muted mt-2">14 días gratis · Sin tarjeta</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                i < step ? "bg-green text-white" :
                i === step ? "bg-ink text-white" :
                "bg-border text-ink-muted"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs flex-1 ${i === step ? "text-ink font-medium" : "text-ink-muted"}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 ${i < step ? "bg-green" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white border border-border rounded-2xl p-8 shadow-card">

          {/* Step 0: Account */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-ink">Creá tu cuenta</h2>
              <Input
                label="Tu nombre"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="María García"
                error={errors.name}
                autoComplete="name"
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="tu@email.com"
                error={errors.email}
                autoComplete="email"
              />
              <Input
                label="Contraseña"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Mínimo 6 caracteres"
                error={errors.password}
                autoComplete="new-password"
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
              />
              <Button onClick={handleNext} size="lg" className="w-full mt-2">
                Continuar →
              </Button>
              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-ink-muted">o</span>
                </div>
              </div>
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </Button>
            </div>
          )}

          {/* Step 1: Store */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-ink">Tu tienda</h2>
                <p className="text-xs text-ink-muted mt-0.5">Podés cambiar todo esto después</p>
              </div>
              <Input
                label="Nombre de tu tienda *"
                value={form.storeName}
                onChange={(e) => update("storeName", e.target.value)}
                placeholder="La Croissantería"
                error={errors.storeName}
              />
              {form.storeName && (
                <div className="bg-green-pale rounded-lg px-3 py-2 text-xs text-green-dark">
                  Tu link: <strong>vendó.app/s/{toSlug(form.storeName)}</strong>
                </div>
              )}
              <Input
                label="WhatsApp donde recibís pedidos *"
                value={form.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
                placeholder="5491199998888"
                prefix="+"
                error={errors.whatsapp}
              />
              <p className="text-[11px] text-ink-muted -mt-2">
                Código de país + número sin espacios. Ej: 5491199998888
              </p>
              <Input
                label="Rubro (opcional)"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                placeholder="Panadería, Ropa, Verdulería..."
              />
              {errors.general && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-lg">
                  {errors.general}
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <Button variant="secondary" onClick={() => setStep(0)} size="lg">
                  ← Atrás
                </Button>
                <Button onClick={handleSubmit} loading={isPending} size="lg" className="flex-1">
                  Crear mi tienda
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Success */}
          {step === 2 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-green-pale rounded-full flex items-center justify-center text-3xl mx-auto">
                🎉
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ink">¡Tu tienda está lista!</h2>
                <p className="text-sm text-ink-muted mt-1">
                  Redirigiendo a tu panel...
                </p>
              </div>
              <div className="bg-surface rounded-xl px-4 py-3">
                <p className="text-[11px] text-ink-muted">Tu link</p>
                <p className="text-sm font-semibold text-green">
                  vendó.app/s/{toSlug(form.storeName)}
                </p>
              </div>
              <div className="flex gap-1 justify-center">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 bg-green rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {step < 2 && (
          <p className="text-center text-sm text-ink-muted mt-5">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-green font-medium hover:underline">
              Ingresá
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
