// src/app/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendó — Tu tienda, tus pedidos, tu WhatsApp",
  description: "Creá tu catálogo digital en minutos. Tus clientes eligen, vos recibís el pedido armado directo en WhatsApp. Sin comisiones, sin apps.",
};

const FEATURES = [
  { icon: "📦", title: "Catálogo digital profesional", desc: "Subí fotos, precios y descripciones. Activá o desactivá productos con un toque. Disponible 24/7." },
  { icon: "💬", title: "Pedidos directo a WhatsApp", desc: "El carrito se convierte en un mensaje ordenado. Recibís nombre, productos y total sin esfuerzo." },
  { icon: "🎨", title: "Tu marca, tu identidad", desc: "Logo, colores y dominio propio. Tu tienda se ve como vos querés, no como una plantilla genérica." },
  { icon: "🔖", title: "Cupones y descuentos", desc: "Creá promociones, códigos de descuento y ofertas especiales para fidelizar clientes." },
  { icon: "📊", title: "Estadísticas que importan", desc: "Mirá qué productos venden más, cuántos pedidos recibiste y tomá decisiones con datos reales." },
  { icon: "🚀", title: "Sin apps para descargar", desc: "Tus clientes entran con un link o QR. Sin registros, sin fricciones." },
];

const PLANS = [
  {
    name: "Principiante", price: "4.900", desc: "Para empezar a vender digitalmente.",
    features: ["Hasta 30 productos", "Catálogo con fotos", "Pedidos por WhatsApp", "Código QR incluido", "Soporte por mail"],
    cta: "Empezar gratis", featured: false,
  },
  {
    name: "Especialista", price: "7.900", desc: "Para negocios que quieren crecer.",
    features: ["Productos ilimitados", "Cupones de descuento", "Dominio personalizado", "Estadísticas avanzadas", "Soporte prioritario"],
    cta: "Empezar gratis", featured: true,
  },
  {
    name: "Pro", price: "12.900", desc: "Para múltiples sucursales.",
    features: ["Todo de Especialista", "Hasta 5 sucursales", "Panel unificado", "API disponible", "Gerente de cuenta"],
    cta: "Empezar gratis", featured: false,
  },
];

const STEPS = [
  { n: "1", title: "Creá tu cuenta", desc: "Registrate en segundos. Sin tarjeta de crédito para empezar." },
  { n: "2", title: "Armá tu catálogo", desc: "Subí tus productos con fotos, precios y categorías desde el celular." },
  { n: "3", title: "Compartí tu link", desc: "Pegá el link en Instagram, WhatsApp Business o Google Maps." },
  { n: "4", title: "Recibí pedidos", desc: "Los pedidos llegan organizados a tu WhatsApp. Solo confirmás y listo." },
];

export default function LandingPage() {
  return (
    <div className="font-sans bg-white">
      {/* NAV */}
      <nav className="flex items-center justify-between px-10 py-5 border-b border-border sticky top-0 bg-white/95 backdrop-blur z-50">
        <span className="font-serif text-2xl text-ink tracking-tight">vend<span className="text-green">ó</span></span>
        <div className="hidden md:flex gap-8 text-sm text-ink-soft">
          <a href="#features" className="hover:text-ink transition-colors">Características</a>
          <a href="#how" className="hover:text-ink transition-colors">Cómo funciona</a>
          <a href="#pricing" className="hover:text-ink transition-colors">Precios</a>
        </div>
        <div className="flex gap-3 items-center">
          <Link href="/login" className="text-sm text-ink-soft hover:text-ink transition-colors">Ingresar</Link>
          <Link href="/register" className="bg-green text-white text-sm font-medium px-4 py-2 rounded-[10px] hover:bg-green-dark transition-colors">
            Probá gratis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-10 pt-20 pb-16 grid grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-green-pale text-green-dark text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-green rounded-full animate-pulse" />
            Más de 5.000 tiendas activas
          </div>
          <h1 className="font-serif text-[3.5rem] leading-[1.1] tracking-tight text-ink mb-6">
            Tu tienda,<br /><em className="italic text-green">tus pedidos,</em><br />tu WhatsApp.
          </h1>
          <p className="text-lg text-ink-soft font-light leading-relaxed mb-8 max-w-md">
            Creá tu catálogo digital en minutos. Tus clientes eligen, vos recibís el pedido armado directo en WhatsApp. Sin comisiones, sin apps.
          </p>
          <div className="flex gap-3 items-center flex-wrap">
            <Link href="/register" className="bg-ink text-white px-6 py-3.5 rounded-[10px] text-[15px] font-medium hover:bg-ink/90 transition-all hover:-translate-y-0.5">
              Empezar gratis — 14 días
            </Link>
            <Link href="/s/lacroissanteria" target="_blank" className="border border-border text-ink px-5 py-3.5 rounded-[10px] text-[15px] font-light hover:border-ink transition-colors">
              Ver tienda demo →
            </Link>
          </div>
          <p className="text-xs text-ink-muted mt-4">Sin tarjeta de crédito · Cancelás cuando querés</p>
        </div>

        {/* Phone mockup */}
        <div className="bg-surface rounded-3xl p-6 border border-border">
          <div className="bg-white rounded-2xl p-5 shadow-card max-w-[280px] mx-auto">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-green-pale rounded-xl flex items-center justify-center text-2xl">🥐</div>
              <div>
                <p className="text-sm font-bold text-ink">La Croissantería</p>
                <p className="text-xs text-ink-muted">Panadería · Belgrano</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[["🥐","Medialuna","$350"],["☕","Café","$890"],["🥗","Tostado","$1.200"],["🧁","Muffin","$650"]].map(([e,n,p]) => (
                <div key={n} className="bg-surface rounded-xl p-2.5">
                  <div className="text-2xl mb-1.5 text-center">{e}</div>
                  <p className="text-[11px] font-semibold text-ink">{n}</p>
                  <p className="text-[11px] font-bold text-green">{p}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#25D366] rounded-xl py-2.5 text-center text-xs font-bold text-white flex items-center justify-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Pedir por WhatsApp
            </div>
          </div>
          {/* Floating notification */}
          <div className="mt-3 bg-white border border-border rounded-xl px-3 py-2.5 shadow-card max-w-[200px] ml-auto">
            <p className="text-[11px] font-semibold text-ink">🛍️ Nuevo pedido</p>
            <p className="text-[10px] text-ink-muted leading-relaxed">Mariana pidió 2x Medialuna, 1x Café</p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border py-10">
        <div className="max-w-6xl mx-auto px-10 flex justify-around flex-wrap gap-8">
          {[["5.000+","Tiendas activas"],["2M+","Pedidos procesados"],["0%","Comisión por venta"],["14 días","Prueba gratuita"]].map(([v,l]) => (
            <div key={l} className="text-center">
              <p className="font-serif text-4xl text-ink">{v}</p>
              <p className="text-sm text-ink-muted mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-10 py-20">
        <p className="text-xs font-semibold text-green-dark tracking-widest uppercase mb-3">Características</p>
        <h2 className="font-serif text-[2.75rem] font-normal tracking-tight text-ink mb-3">Todo lo que tu negocio<br />necesita para vender más</h2>
        <p className="text-base text-ink-soft font-light max-w-lg mb-12">Diseñado para gastronómicos, tiendas de ropa, almacenes, y cualquier comercio que quiera digitalizarse.</p>
        <div className="grid grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-surface border border-border rounded-2xl p-6 hover:border-green transition-colors">
              <div className="w-11 h-11 bg-green-pale rounded-xl flex items-center justify-center text-xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-ink text-sm mb-2">{f.title}</h3>
              <p className="text-sm text-ink-soft font-light leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-surface py-20">
        <div className="max-w-6xl mx-auto px-10">
          <p className="text-xs font-semibold text-green-dark tracking-widest uppercase mb-3">Cómo funciona</p>
          <h2 className="font-serif text-[2.75rem] font-normal tracking-tight text-ink mb-12">En 4 pasos tenés<br />tu tienda lista</h2>
          <div className="grid grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="w-10 h-10 bg-ink text-white rounded-full flex items-center justify-center text-sm font-semibold mb-4">{s.n}</div>
                {i < STEPS.length - 1 && (
                  <div className="absolute top-5 left-10 w-full h-px bg-border" />
                )}
                <h3 className="font-semibold text-ink text-sm mb-2">{s.title}</h3>
                <p className="text-sm text-ink-soft font-light leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-6xl mx-auto px-10 py-20">
        <p className="text-xs font-semibold text-green-dark tracking-widest uppercase mb-3">Precios</p>
        <h2 className="font-serif text-[2.75rem] font-normal tracking-tight text-ink mb-3">Simple y sin sorpresas</h2>
        <p className="text-base text-ink-soft font-light max-w-md mb-12">Todos los planes incluyen 14 días de prueba gratuita. Cancelás cuando querés.</p>
        <div className="grid grid-cols-3 gap-5">
          {PLANS.map(plan => (
            <div key={plan.name} className={`relative bg-white rounded-2xl border p-7 ${plan.featured ? "border-ink shadow-float" : "border-border"}`}>
              {plan.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-ink text-white text-[11px] font-bold px-3 py-1 rounded-full">Más elegido</div>
              )}
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-widest mb-2">{plan.name}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-serif text-[2.5rem] text-ink">${plan.price}</span>
                <span className="text-xs text-ink-muted">/ mes</span>
              </div>
              <p className="text-sm text-ink-soft font-light mb-5">{plan.desc}</p>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
                    <span className="text-green font-semibold mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`block w-full py-2.5 rounded-[10px] text-sm font-medium text-center transition-colors ${
                  plan.featured ? "bg-green text-white hover:bg-green-dark" : "border border-border text-ink hover:border-ink"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-10 mb-20 bg-ink rounded-3xl py-20 px-12 text-center">
        <h2 className="font-serif text-[3rem] font-normal text-white tracking-tight mb-3">
          ¿Listo para vender<br /><em className="italic text-green">más y mejor?</em>
        </h2>
        <p className="text-base text-white/60 font-light mb-8">Más de 5.000 negocios ya eligieron Vendó. Sumá el tuyo hoy.</p>
        <Link href="/register" className="inline-block bg-white text-ink px-8 py-3.5 rounded-[10px] text-[15px] font-medium hover:bg-white/90 transition-colors">
          Probá gratis 14 días →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border px-10 py-6 flex items-center justify-between">
        <span className="font-serif text-xl text-ink">vend<span className="text-green">ó</span></span>
        <div className="flex gap-6 text-sm text-ink-muted">
          {["Términos","Privacidad","Ayuda","Instagram"].map(l => (
            <a key={l} href="#" className="hover:text-ink transition-colors">{l}</a>
          ))}
        </div>
        <p className="text-xs text-ink-muted">© {new Date().getFullYear()} Vendó</p>
      </footer>
    </div>
  );
}
