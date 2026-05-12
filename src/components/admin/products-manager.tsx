// src/components/admin/products-manager.tsx
"use client";

import { useState, useTransition } from "react";
import type { ProductWithCategory } from "@/types";
import type { Category } from "@prisma/client";
import { formatPrice, fromCents } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";

interface Props {
  initialProducts: ProductWithCategory[];
  categories: Category[];
  storeId: string;
}

const EMPTY_FORM = {
  name: "", price: "", description: "", emoji: "🛍️", categoryId: "", available: true, featured: false,
};

export function ProductsManager({ initialProducts, categories, storeId }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ProductWithCategory | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();
  const { add: toast } = useToast();

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p: ProductWithCategory) => {
    setEditing(p);
    setForm({
      name: p.name,
      price: String(fromCents(p.price)),
      description: p.description ?? "",
      emoji: p.emoji ?? "🛍️",
      categoryId: p.categoryId ?? "",
      available: p.available,
      featured: p.featured,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    startTransition(async () => {
      const payload = {
        name: form.name,
        price: parseFloat(form.price),
        description: form.description || undefined,
        emoji: form.emoji || undefined,
        categoryId: form.categoryId || null,
        available: form.available,
        featured: form.featured,
      };

      const url = editing ? `/api/products/${editing.id}` : "/api/products";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? payload : { ...payload, storeId }),
      });

      const data = await res.json();

      if (!data.success) {
        toast(data.error ?? "Error al guardar", "error");
        return;
      }

      if (editing) {
        setProducts((ps) => ps.map((p) => (p.id === editing.id ? data.data : p)));
        toast("Producto actualizado", "success");
      } else {
        setProducts((ps) => [data.data, ...ps]);
        toast("Producto creado", "success");
      }

      setShowModal(false);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    startTransition(async () => {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts((ps) => ps.filter((p) => p.id !== id));
        toast("Producto eliminado", "success");
      } else {
        toast("Error al eliminar", "error");
      }
    });
  };

  const toggleAvailable = (p: ProductWithCategory) => {
    startTransition(async () => {
      const res = await fetch(`/api/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !p.available }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((ps) => ps.map((x) => (x.id === p.id ? data.data : x)));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-normal text-ink">Productos</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {products.length} productos · {products.filter((p) => p.available).length} disponibles
          </p>
        </div>
        <Button onClick={openCreate} size="md">
          + Agregar producto
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Buscar producto..."
            className="bg-surface"
          />
        </div>

        <table className="w-full text-sm">
          <thead className="bg-surface text-xs text-ink-muted">
            <tr>
              {["Producto", "Categoría", "Precio", "Estado", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-ink-muted">
                  <div className="text-3xl mb-2">📦</div>
                  {search ? `No se encontró "${search}"` : "No tenés productos todavía"}
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.emoji ?? "🛍️"}</span>
                    <div>
                      <p className="font-medium text-ink">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-ink-muted truncate max-w-[200px]">{p.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  {p.category ? (
                    <Badge>{p.category.name}</Badge>
                  ) : (
                    <span className="text-ink-muted text-xs">Sin categoría</span>
                  )}
                </td>
                <td className="px-5 py-4 font-semibold text-ink">{formatPrice(p.price)}</td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => toggleAvailable(p)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${
                      p.available ? "bg-green" : "bg-ink-muted/30"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                        p.available ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2 justify-end">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
                      🗑️
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Editar producto" : "Nuevo producto"}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={isPending}>
              {editing ? "Guardar cambios" : "Crear producto"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-20">
              <Input
                label="Emoji"
                value={form.emoji}
                onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                className="text-2xl text-center"
                maxLength={2}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Nombre del producto *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Medialuna de manteca"
              />
            </div>
          </div>

          <Input
            label="Precio *"
            type="number"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            placeholder="350"
            prefix="$"
          />

          <div>
            <label className="text-xs text-ink-muted font-medium block mb-1.5">Categoría</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-border rounded-[8px] bg-white font-sans focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green"
            >
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>

          <Textarea
            label="Descripción"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describí tu producto..."
            rows={2}
          />

          <div className="flex items-center gap-6">
            {[
              { key: "available", label: "Disponible para pedir" },
              { key: "featured", label: "Destacado en el catálogo" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  className="w-4 h-4 accent-green rounded"
                />
                <span className="text-sm text-ink-soft">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
