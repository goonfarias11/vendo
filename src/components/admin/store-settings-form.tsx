// src/components/admin/store-settings-form.tsx
"use client";

import { useState, useTransition } from "react";
import type { Store, Category } from "@prisma/client";
import { toSlug, fromCents, toCents } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type StoreWithCategories = Store & { categories: Category[]; subscription?: any };

const BRAND_COLORS = [
  "#0ABF6E", "#3B82F6", "#8B5CF6", "#F59E0B",
  "#EF4444", "#EC4899", "#06B6D4", "#F97316",
];

interface Props {
  store: StoreWithCategories;
}

export function StoreSettingsForm({ store }: Props) {
  const [form, setForm] = useState({
    name: store.name,
    slug: store.slug,
    description: store.description ?? "",
    category: store.category ?? "",
    whatsapp: store.whatsapp,
    address: store.address ?? "",
    city: store.city ?? "",
    primaryColor: store.primaryColor,
    minOrder: store.minOrder ? String(store.minOrder / 100) : "0",
  });
  const [slugError, setSlugError] = useState("");
  const [isPending, startTransition] = useTransition();
  const { add: toast } = useToast();

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSlugChange = (v: string) => {
    const clean = toSlug(v);
    update("slug", clean);
    setSlugError(clean.length < 3 ? "Mínimo 3 caracteres" : "");
  };

  const handleSave = () => {
    if (slugError) return;
    startTransition(async () => {
      const res = await fetch(`/api/stores/${store.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          minOrder: Math.round(parseFloat(form.minOrder || "0") * 100),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast("Cambios guardados", "success");
      } else {
        toast(data.error ?? "Error al guardar", "error");
        if (data.error?.includes("link")) setSlugError(data.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-normal text-ink">Mi tienda</h1>
        <p className="text-sm text-ink-muted mt-0.5">
          Personalizá cómo ven tu tienda tus clientes
        </p>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-6">
        {/* Form */}
        <div className="space-y-5">
          {/* Basic info */}
          <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-ink">Información básica</h2>

            <Input
              label="Nombre de la tienda"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="La Croissantería"
            />

            <div>
              <Input
                label="Link de tu tienda"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                prefix="vendó.app/s/"
                placeholder="mitienda"
                error={slugError}
              />
              <p className="text-[11px] text-ink-muted mt-1">
                Solo letras minúsculas, números y guiones. Sin espacios.
              </p>
            </div>

            <Input
              label="Categoría del negocio"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              placeholder="Panadería, Ropa, Verdulería..."
            />

            <Textarea
              label="Descripción"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Contale a tus clientes qué vendés..."
              rows={3}
            />
          </div>

          {/* Contact */}
          <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-ink">Contacto y ubicación</h2>

            <Input
              label="Número de WhatsApp"
              value={form.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
              placeholder="5491199998888"
              prefix="+"
            />
            <p className="text-[11px] text-ink-muted -mt-2">
              Código de país + número sin espacios. Ej: 5491199998888
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Dirección"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="Av. Corrientes 1234"
              />
              <Input
                label="Ciudad"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Buenos Aires"
              />
            </div>

            <Input
              label="Pedido mínimo"
              type="number"
              value={form.minOrder}
              onChange={(e) => update("minOrder", e.target.value)}
              prefix="$"
              placeholder="0"
            />
            <p className="text-[11px] text-ink-muted -mt-2">
              Dejá en 0 para no tener mínimo
            </p>
          </div>

          {/* Brand */}
          <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-ink">Marca y apariencia</h2>

            <div>
              <label className="text-xs text-ink-muted font-medium block mb-2">
                Color principal
              </label>
              <div className="flex gap-2 flex-wrap">
                {BRAND_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => update("primaryColor", color)}
                    title={color}
                    className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                    style={{
                      background: color,
                      outline: form.primaryColor === color ? `3px solid ${color}` : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  className="w-8 h-8 rounded-full border border-border cursor-pointer"
                  title="Color personalizado"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} loading={isPending} size="lg" className="w-full">
            Guardar cambios
          </Button>
        </div>

        {/* Live preview */}
        <div className="sticky top-24 self-start">
          <div className="bg-white border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-ink mb-4">Vista previa</h2>

            {/* Phone mockup */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden max-w-[260px] mx-auto">
              {/* Header */}
              <div
                className="px-4 pt-5 pb-8"
                style={{ background: form.primaryColor }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  >
                    🛍️
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">
                      {form.name || "Nombre de tu tienda"}
                    </p>
                    <p className="text-[10px] text-white/70">
                      {form.category || "Categoría"}
                      {form.city ? ` · ${form.city}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {form.description && (
                <div className="mx-3 -mt-4 bg-white rounded-xl p-3 shadow-sm border border-border mb-3">
                  <p className="text-[10px] text-ink-soft leading-relaxed line-clamp-2">
                    {form.description}
                  </p>
                </div>
              )}

              {/* Products */}
              <div className="px-3 pb-4 space-y-1.5">
                {[
                  { emoji: "🥐", name: "Medialuna de manteca", price: "$350" },
                  { emoji: "☕", name: "Café con leche", price: "$890" },
                  { emoji: "🧁", name: "Muffin de arándanos", price: "$650" },
                ].map((p) => (
                  <div
                    key={p.name}
                    className="bg-white border border-border rounded-xl p-2.5 flex items-center gap-2"
                  >
                    <span className="text-xl">{p.emoji}</span>
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold text-ink">{p.name}</p>
                      <p className="text-[10px] font-bold" style={{ color: form.primaryColor }}>
                        {p.price}
                      </p>
                    </div>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: form.primaryColor }}
                    >+</div>
                  </div>
                ))}
              </div>

              {/* WhatsApp btn */}
              <div className="px-3 pb-4">
                <div className="bg-[#25D366] rounded-xl py-2.5 text-center text-[11px] font-bold text-white">
                  Pedir por WhatsApp
                </div>
              </div>
            </div>

            {/* Store link */}
            <div className="mt-4 bg-surface rounded-xl px-4 py-3">
              <p className="text-[10px] text-ink-muted mb-1">Tu link público</p>
              <p className="text-xs font-semibold text-green truncate">
                vendó.app/s/{form.slug || "mitienda"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
