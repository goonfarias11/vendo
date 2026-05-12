// src/app/docs/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Docs — Vendó",
  description: "Documentación de la API pública de Vendó para integraciones.",
};

const ENDPOINTS = [
  {
    method: "GET", path: "/api/stores/[slug]",
    desc: "Obtener info pública de una tienda por su slug",
    auth: false,
    response: `{ id, name, slug, description, category, primaryColor, whatsapp, minOrder }`,
  },
  {
    method: "GET", path: "/api/products?storeId=[id]",
    desc: "Listar productos de una tienda",
    auth: false,
    response: `[{ id, name, description, price, emoji, imageUrl, available, featured, category }]`,
  },
  {
    method: "POST", path: "/api/orders",
    desc: "Crear un pedido",
    auth: false,
    body: `{ storeId, customerName, customerPhone?, customerNote?, items: [{ productId, qty }] }`,
    response: `{ id, number, total, status, items }`,
  },
  {
    method: "POST", path: "/api/coupons/validate",
    desc: "Validar un cupón de descuento",
    auth: false,
    body: `{ storeId, code, cartTotal }`,
    response: `{ code, type, value, discount, finalTotal, description }`,
  },
  {
    method: "GET", path: "/api/products",
    desc: "Listar todos los productos del store autenticado",
    auth: true,
    response: `[{ id, name, price, available, category }]`,
  },
  {
    method: "POST", path: "/api/products",
    desc: "Crear un producto",
    auth: true,
    body: `{ storeId, name, price, description?, emoji?, categoryId?, available?, featured? }`,
    response: `{ id, name, price, ... }`,
  },
  {
    method: "PATCH", path: "/api/products/[id]",
    desc: "Actualizar un producto",
    auth: true,
    body: `{ name?, price?, description?, available?, featured?, categoryId? }`,
    response: `{ id, name, price, ... }`,
  },
  {
    method: "DELETE", path: "/api/products/[id]",
    desc: "Eliminar un producto",
    auth: true,
    response: `{ deleted: true }`,
  },
  {
    method: "GET", path: "/api/orders?storeId=[id]",
    desc: "Listar pedidos del store (últimos 50)",
    auth: true,
    response: `[{ id, number, customerName, total, status, items, createdAt }]`,
  },
  {
    method: "PATCH", path: "/api/orders/[id]",
    desc: "Actualizar estado de un pedido",
    auth: true,
    body: `{ status: "NEW"|"CONFIRMED"|"PREPARING"|"READY"|"DELIVERED"|"CANCELLED" }`,
    response: `{ id, status, ... }`,
  },
  {
    method: "PATCH", path: "/api/stores/[id]",
    desc: "Actualizar configuración de la tienda",
    auth: true,
    body: `{ name?, slug?, description?, whatsapp?, primaryColor?, minOrder? }`,
    response: `{ id, name, slug, ... }`,
  },
  {
    method: "GET", path: "/api/subscriptions/status",
    desc: "Obtener estado de suscripción del store",
    auth: true,
    response: `{ plan, status, isActive, trialDaysLeft, currentPeriodEnd }`,
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-50 text-blue-700",
  POST: "bg-green-pale text-green-dark",
  PATCH: "bg-amber-50 text-amber-700",
  DELETE: "bg-red-50 text-red-700",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-surface font-sans">
      <nav className="bg-white border-b border-border px-10 py-4 flex items-center justify-between sticky top-0 z-10">
        <a href="/" className="font-serif text-xl text-ink">vend<span className="text-green">ó</span></a>
        <span className="text-sm font-semibold text-ink-muted bg-surface px-3 py-1 rounded-full">API Docs</span>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-serif text-4xl text-ink mb-3">API Reference</h1>
          <p className="text-base text-ink-soft font-light leading-relaxed max-w-xl">
            La API de Vendó permite integrar tu tienda con sistemas externos, apps móviles o automatizaciones.
            Disponible para el plan <strong>Pro</strong>.
          </p>
        </div>

        {/* Base URL */}
        <div className="bg-white border border-border rounded-2xl p-5 mb-8">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">Base URL</p>
          <code className="text-sm font-mono text-ink bg-surface px-3 py-1.5 rounded-lg">
            https://vendo.app/api
          </code>
        </div>

        {/* Auth */}
        <div className="bg-white border border-border rounded-2xl p-5 mb-8">
          <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">Autenticación</p>
          <p className="text-sm text-ink-soft mb-3">
            Los endpoints marcados con 🔐 requieren una sesión activa (cookie de NextAuth) o un API key (próximamente).
          </p>
          <p className="text-sm text-ink-soft">
            Los endpoints públicos no requieren autenticación y tienen rate limiting de <strong>10 requests/5 min por IP</strong>.
          </p>
        </div>

        {/* Endpoints */}
        <div className="space-y-4">
          <h2 className="font-semibold text-ink text-lg">Endpoints</h2>
          {ENDPOINTS.map((ep, i) => (
            <div key={i} className="bg-white border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${METHOD_COLORS[ep.method]}`}>
                  {ep.method}
                </span>
                <code className="text-sm font-mono text-ink flex-1">{ep.path}</code>
                {ep.auth && (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    🔐 Auth
                  </span>
                )}
              </div>
              <div className="px-5 py-4 space-y-3">
                <p className="text-sm text-ink-soft">{ep.desc}</p>
                {ep.body && (
                  <div>
                    <p className="text-xs font-semibold text-ink-muted mb-1.5">Request body</p>
                    <pre className="text-xs bg-surface rounded-lg px-3 py-2.5 overflow-x-auto text-ink-soft font-mono">
                      {ep.body}
                    </pre>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-ink-muted mb-1.5">Response</p>
                  <pre className="text-xs bg-surface rounded-lg px-3 py-2.5 overflow-x-auto text-green-dark font-mono">
                    {ep.response}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error codes */}
        <div className="mt-8 bg-white border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-ink text-base mb-4">Códigos de error</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-muted border-b border-border">
                <th className="pb-2 font-medium">Código</th>
                <th className="pb-2 font-medium">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["200", "OK — Operación exitosa"],
                ["201", "Created — Recurso creado"],
                ["400", "Bad Request — Datos inválidos"],
                ["401", "Unauthorized — Falta autenticación"],
                ["403", "Forbidden — Sin permiso"],
                ["404", "Not Found — Recurso no encontrado"],
                ["409", "Conflict — Ya existe (ej: slug duplicado)"],
                ["429", "Too Many Requests — Rate limit alcanzado"],
                ["500", "Internal Server Error — Error del servidor"],
              ].map(([code, desc]) => (
                <tr key={code}>
                  <td className="py-2.5 font-mono font-semibold text-ink">{code}</td>
                  <td className="py-2.5 text-ink-soft">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Response format */}
        <div className="mt-4 bg-white border border-border rounded-2xl p-5">
          <h2 className="font-semibold text-ink text-base mb-3">Formato de respuesta</h2>
          <p className="text-sm text-ink-soft mb-3">Todas las respuestas usan el siguiente formato:</p>
          <pre className="text-xs bg-surface rounded-xl px-4 py-3 font-mono text-ink-soft overflow-x-auto">{`// Éxito
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "Descripción del error" }`}</pre>
        </div>
      </div>
    </div>
  );
}
