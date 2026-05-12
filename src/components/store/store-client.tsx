// src/components/store/store-client.tsx
"use client";

import { useState } from "react";
import type { StoreWithProducts } from "@/types";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, buildWhatsAppUrl, buildWhatsAppMessage } from "@/lib/utils";
import { fromCents } from "@/lib/utils";

interface Props {
  store: StoreWithProducts;
}

export function StoreClient({ store }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [step, setStep] = useState<"catalog" | "checkout">("catalog");

  const { items, add, remove, clear, total, totalItems } = useCart();
  const cartTotal = total();
  const cartCount = totalItems();
  const minOrder = store.minOrder ?? 0; // already in cents

  const categories = [
    { id: "all", name: "Todo", emoji: "✨" },
    ...store.categories,
  ];

  const filtered = store.products.filter((p) => {
    const matchCat = activeCategory === "all" || p.categoryId === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = store.products.filter((p) => p.featured);

  const handleSendOrder = () => {
    if (!customerName.trim()) return;

    const waItems = items.map((i) => ({
      name: i.name,
      qty: i.qty,
      price: i.price,
    }));

    let message = buildWhatsAppMessage(waItems, store.name, cartTotal);
    if (customerName) message = `*Nombre:* ${customerName}\n\n` + message;
    if (customerNote) message += `\n\n📝 *Nota:* ${customerNote}`;

    const url = buildWhatsAppUrl(store.whatsapp, message);
    window.open(url, "_blank");
    clear();
    setCartOpen(false);
    setStep("catalog");
    setCustomerName("");
    setCustomerNote("");
  };

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "#F7F8FA" }}
    >
      <div className="max-w-[480px] mx-auto relative">

        {/* Header */}
        <div
          className="px-5 pt-8 pb-14"
          style={{ background: store.primaryColor }}
        >
          <div className="flex justify-between items-start">
            <div className="flex gap-3 items-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  "🛍️"
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">{store.name}</h1>
                <p className="text-xs text-white/70 mt-0.5">{store.category}</p>
              </div>
            </div>
            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative w-11 h-11 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              🛍️
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-ink text-white w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Info pills */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {[
              { icon: "⭐", text: "4.8 (312)" },
              { icon: "🕐", text: "20–35 min" },
              ...(minOrder > 0 ? [{ icon: "📦", text: `Min. ${formatPrice(minOrder)}` }] : []),
            ].map((pill) => (
              <div
                key={pill.text}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs text-white font-medium"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                {pill.icon} {pill.text}
              </div>
            ))}
          </div>
        </div>

        {/* Description card */}
        {store.description && (
          <div className="mx-4 -mt-5 bg-white rounded-2xl p-4 shadow-card border border-border mb-4">
            <p className="text-sm text-ink-soft leading-relaxed">{store.description}</p>
          </div>
        )}

        {/* Search */}
        <div className="px-4 mb-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en el menú..."
              className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm bg-white font-sans focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-4">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={
                activeCategory === c.id
                  ? { background: store.primaryColor + "20", borderColor: store.primaryColor, color: store.primaryColor }
                  : { background: "white", borderColor: "rgba(0,0,0,0.08)", color: "#444850" }
              }
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>

        {/* Featured row */}
        {activeCategory === "all" && !search && featured.length > 0 && (
          <div className="px-4 mb-5">
            <h2 className="text-sm font-bold text-ink mb-3">⭐ Los más pedidos</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {featured.map((p) => {
                const qty = items.find((i) => i.productId === p.id)?.qty ?? 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => add({ productId: p.id, name: p.name, price: p.price, emoji: p.emoji })}
                    className="flex-shrink-0 w-32 bg-white border border-border rounded-2xl p-3 cursor-pointer hover:-translate-y-0.5 transition-transform"
                  >
                    <div className="text-3xl text-center mb-2">{p.emoji ?? "🛍️"}</div>
                    <p className="text-xs font-bold text-ink leading-snug mb-1">{p.name}</p>
                    <p className="text-xs font-bold" style={{ color: store.primaryColor }}>
                      {formatPrice(p.price)}
                    </p>
                    {qty > 0 && (
                      <span className="mt-1 text-[10px] bg-ink text-white px-1.5 py-0.5 rounded-full font-bold">
                        {qty} en carrito
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Product list */}
        <div className="px-4 pb-28 space-y-2.5">
          {activeCategory === "all" && !search && (
            <h2 className="text-sm font-bold text-ink mb-1">Todos los productos</h2>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-14 text-ink-muted">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm">No encontramos resultados</p>
            </div>
          )}

          {filtered.map((p) => {
            const qty = items.find((i) => i.productId === p.id)?.qty ?? 0;
            return (
              <div
                key={p.id}
                className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3 hover:shadow-card transition-shadow"
              >
                <div className="w-14 h-14 bg-surface rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  {p.emoji ?? "🛍️"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-sm font-bold text-ink">{p.name}</p>
                    {p.featured && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: store.primaryColor + "20", color: store.primaryColor }}>
                        POPULAR
                      </span>
                    )}
                  </div>
                  {p.description && (
                    <p className="text-xs text-ink-muted leading-snug mb-1.5">{p.description}</p>
                  )}
                  <p className="text-sm font-bold text-ink">{formatPrice(p.price)}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-1.5">
                  {qty > 0 ? (
                    <>
                      <button
                        onClick={() => remove(p.id)}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-ink-soft font-bold text-base hover:border-ink transition-colors"
                      >−</button>
                      <span className="text-sm font-bold text-ink w-4 text-center">{qty}</span>
                    </>
                  ) : null}
                  <button
                    onClick={() => add({ productId: p.id, name: p.name, price: p.price, emoji: p.emoji })}
                    className="w-8 h-8 rounded-full border-none flex items-center justify-center text-white font-bold text-base active:scale-90 transition-transform"
                    style={{ background: store.primaryColor }}
                  >+</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky cart bar */}
        {cartCount > 0 && !cartOpen && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-4 z-50">
            <button
              onClick={() => setCartOpen(true)}
              className="w-full bg-ink text-white rounded-2xl px-5 py-4 flex justify-between items-center shadow-modal text-sm font-semibold"
            >
              <span className="bg-white/15 px-2.5 py-0.5 rounded-lg text-xs">{cartCount} items</span>
              <span>Ver pedido</span>
              <span className="font-serif text-base">{formatPrice(cartTotal)}</span>
            </button>
          </div>
        )}

        {/* Cart drawer */}
        {cartOpen && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end max-w-[480px] mx-auto left-0 right-0">
            <div className="absolute inset-0 bg-ink/50" onClick={() => { setCartOpen(false); setStep("catalog"); }} />
            <div className="relative bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto">

              {/* Cart header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border sticky top-0 bg-white z-10">
                {step === "checkout" && (
                  <button onClick={() => setStep("catalog")} className="text-sm text-ink-muted hover:text-ink">
                    ← Atrás
                  </button>
                )}
                <h2 className="text-base font-bold text-ink flex-1">
                  {step === "catalog" ? "Tu pedido" : "Confirmar pedido"}
                </h2>
                <button
                  onClick={() => { setCartOpen(false); setStep("catalog"); }}
                  className="w-7 h-7 bg-surface rounded-full flex items-center justify-center text-ink-muted text-xs"
                >✕</button>
              </div>

              <div className="px-5 py-4">
                {step === "catalog" ? (
                  <>
                    {/* Items */}
                    <div className="space-y-3 mb-5">
                      {items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-3">
                          <span className="text-2xl">{item.emoji ?? "🛍️"}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-ink">{item.name}</p>
                            <p className="text-xs font-bold" style={{ color: store.primaryColor }}>
                              {formatPrice(item.price * item.qty)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => remove(item.productId)}
                              className="w-7 h-7 border border-border rounded-full flex items-center justify-center text-ink-soft font-bold hover:border-ink">−</button>
                            <span className="text-sm font-bold w-3 text-center">{item.qty}</span>
                            <button onClick={() => add(item)}
                              className="w-7 h-7 rounded-full text-white font-bold flex items-center justify-center"
                              style={{ background: store.primaryColor }}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="border-t border-border pt-4 space-y-1.5 mb-5">
                      <div className="flex justify-between text-xs text-ink-muted">
                        <span>Subtotal</span><span>{formatPrice(cartTotal)}</span>
                      </div>
                      {minOrder > 0 && cartTotal < minOrder && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-amber-800">
                          ⚠️ Pedido mínimo {formatPrice(minOrder)} — te faltan {formatPrice(minOrder - cartTotal)}
                        </div>
                      )}
                      <div className="flex justify-between text-base font-bold text-ink pt-1">
                        <span>Total</span><span>{formatPrice(cartTotal)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setStep("checkout")}
                      disabled={minOrder > 0 && cartTotal < minOrder}
                      className="w-full py-4 rounded-2xl text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                      style={{ background: store.primaryColor }}
                    >
                      Continuar →
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-4 mb-5">
                      <div>
                        <label className="text-xs text-ink-muted font-medium block mb-1.5">
                          Tu nombre *
                        </label>
                        <input
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Ej: Mariana López"
                          className="w-full px-3 py-2.5 border border-border rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-ink-muted font-medium block mb-1.5">
                          Nota para la tienda (opcional)
                        </label>
                        <textarea
                          value={customerNote}
                          onChange={(e) => setCustomerNote(e.target.value)}
                          placeholder="Ej: sin azúcar, para llevar..."
                          rows={2}
                          className="w-full px-3 py-2.5 border border-border rounded-xl text-sm font-sans resize-none focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green"
                        />
                      </div>

                      {/* Order summary */}
                      <div className="bg-surface rounded-2xl p-4">
                        <p className="text-xs font-medium text-ink-muted mb-2">Resumen</p>
                        {items.map((item) => (
                          <div key={item.productId} className="flex justify-between text-xs text-ink-soft py-0.5">
                            <span>{item.qty}× {item.name}</span>
                            <span>{formatPrice(item.price * item.qty)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-bold text-ink mt-2 pt-2 border-t border-border">
                          <span>Total</span>
                          <span>{formatPrice(cartTotal)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSendOrder}
                      disabled={!customerName.trim()}
                      className="w-full py-4 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: "#25D366" }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Enviar pedido por WhatsApp
                    </button>
                    <p className="text-center text-[11px] text-ink-muted mt-3">
                      Se abrirá WhatsApp con tu pedido listo para enviar
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
