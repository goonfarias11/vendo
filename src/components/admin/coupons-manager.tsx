// src/components/admin/coupons-manager.tsx
"use client";

import { useState, useTransition } from "react";
import type { Coupon } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface Props {
  initialCoupons: Coupon[];
  storeId: string;
}

const EMPTY_FORM = {
  code: "", type: "PERCENT" as "PERCENT" | "FIXED",
  value: "", minOrder: "", maxUses: "", expiresAt: "",
};

export function CouponsManager({ initialCoupons, storeId }: Props) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();
  const { add: toast } = useToast();

  const update = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = () => {
    if (!form.code || !form.value) return;
    startTransition(async () => {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          code: form.code.toUpperCase(),
          type: form.type,
          value: parseFloat(form.value),
          minOrder: parseFloat(form.minOrder || "0"),
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!data.success) { toast(data.error, "error"); return; }
      setCoupons(c => [data.data, ...c]);
      setShowModal(false);
      setForm(EMPTY_FORM);
      toast("Cupón creado", "success");
    });
  };

  const handleToggle = (coupon: Coupon) => {
    startTransition(async () => {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !coupon.active }),
      });
      const data = await res.json();
      if (data.success) setCoupons(cs => cs.map(c => c.id === coupon.id ? data.data : c));
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar este cupón?")) return;
    startTransition(async () => {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCoupons(cs => cs.filter(c => c.id !== id));
        toast("Cupón eliminado", "success");
      }
    });
  };

  const isExpired = (coupon: Coupon) =>
    coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false;

  const isExhausted = (coupon: Coupon) =>
    coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-normal text-ink">Cupones</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {coupons.filter(c => c.active).length} activos · {coupons.length} en total
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Crear cupón</Button>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl py-16 text-center text-ink-muted">
          <div className="text-4xl mb-3">🎟️</div>
          <p className="text-sm font-medium text-ink mb-1">Todavía no tenés cupones</p>
          <p className="text-xs">Creá descuentos para fidelizar a tus clientes</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs text-ink-muted">
              <tr>
                {["Código", "Descuento", "Mínimo", "Usos", "Vence", "Estado", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map(coupon => {
                const expired = isExpired(coupon);
                const exhausted = isExhausted(coupon);
                const effectivelyInactive = !coupon.active || expired || exhausted;

                return (
                  <tr key={coupon.id} className={`hover:bg-surface/50 transition-colors ${effectivelyInactive ? "opacity-60" : ""}`}>
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-ink tracking-wider bg-surface px-2.5 py-1 rounded-lg text-sm">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-green-dark">
                      {coupon.type === "PERCENT"
                        ? `${coupon.value}% off`
                        : `${formatPrice(coupon.value)} off`}
                    </td>
                    <td className="px-5 py-4 text-ink-muted text-xs">
                      {coupon.minOrder > 0 ? formatPrice(coupon.minOrder) : "Sin mínimo"}
                    </td>
                    <td className="px-5 py-4 text-ink-muted text-xs">
                      {coupon.usedCount}
                      {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : " / ∞"}
                    </td>
                    <td className="px-5 py-4 text-ink-muted text-xs">
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
                        : "Sin vencimiento"}
                    </td>
                    <td className="px-5 py-4">
                      {expired ? (
                        <Badge variant="red">Vencido</Badge>
                      ) : exhausted ? (
                        <Badge variant="gray">Agotado</Badge>
                      ) : (
                        <button
                          onClick={() => handleToggle(coupon)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${coupon.active ? "bg-green" : "bg-ink-muted/30"}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${coupon.active ? "left-[22px]" : "left-0.5"}`} />
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(coupon.id)}>🗑️</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Nuevo cupón"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleCreate} loading={isPending}>Crear cupón</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Código *"
            value={form.code}
            onChange={e => update("code", e.target.value.toUpperCase())}
            placeholder="PROMO20"
            className="font-mono tracking-wider uppercase"
          />

          <div>
            <label className="text-xs text-ink-muted font-medium block mb-1.5">Tipo de descuento</label>
            <div className="flex gap-2">
              {(["PERCENT", "FIXED"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => update("type", t)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                    form.type === t ? "bg-ink text-white border-ink" : "bg-white text-ink-soft border-border"
                  }`}
                >
                  {t === "PERCENT" ? "% Porcentaje" : "$ Fijo"}
                </button>
              ))}
            </div>
          </div>

          <Input
            label={`Valor ${form.type === "PERCENT" ? "(%)" : "($)"} *`}
            type="number"
            value={form.value}
            onChange={e => update("value", e.target.value)}
            placeholder={form.type === "PERCENT" ? "20" : "500"}
            suffix={form.type === "PERCENT" ? "%" : "ARS"}
          />

          <Input
            label="Compra mínima (opcional)"
            type="number"
            value={form.minOrder}
            onChange={e => update("minOrder", e.target.value)}
            placeholder="0"
            prefix="$"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Usos máximos"
              type="number"
              value={form.maxUses}
              onChange={e => update("maxUses", e.target.value)}
              placeholder="∞ ilimitado"
            />
            <Input
              label="Fecha de vencimiento"
              type="date"
              value={form.expiresAt}
              onChange={e => update("expiresAt", e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
