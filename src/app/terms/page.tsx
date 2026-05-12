// src/app/terms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Términos de servicio — Vendó" };

export default function TermsPage() {
  const sections = [
    {
      title: "1. Aceptación de términos",
      content: "Al registrarte y usar Vendó, aceptás estos Términos de Servicio. Si no estás de acuerdo, no uses el servicio.",
    },
    {
      title: "2. Descripción del servicio",
      content: "Vendó es una plataforma SaaS que permite a comercios crear catálogos digitales y recibir pedidos a través de WhatsApp. No somos intermediarios en las transacciones entre el comercio y sus clientes.",
    },
    {
      title: "3. Cuentas de usuario",
      content: "Sos responsable de mantener la seguridad de tu cuenta. Notificanos inmediatamente si detectás acceso no autorizado. No podés transferir tu cuenta a terceros sin nuestro consentimiento.",
    },
    {
      title: "4. Suscripciones y pagos",
      content: "Los planes de suscripción se cobran mensualmente mediante Mercado Pago. El período de prueba de 14 días no requiere tarjeta de crédito. Al terminar el trial, necesitás suscribirte para mantener el acceso.",
    },
    {
      title: "5. Cancelación",
      content: "Podés cancelar tu suscripción en cualquier momento desde el panel de facturación. Tu tienda permanecerá activa hasta el final del período ya pagado.",
    },
    {
      title: "6. Uso aceptable",
      content: "No podés usar Vendó para actividades ilegales, spam, o contenido que viole los derechos de terceros. Nos reservamos el derecho de suspender cuentas que violen estas políticas.",
    },
    {
      title: "7. Propiedad intelectual",
      content: "El contenido que subís a Vendó (fotos, descripciones, logos) es tuyo. Nos otorgás una licencia para mostrarlo en nuestra plataforma. El código y diseño de Vendó son propiedad de Vendó.",
    },
    {
      title: "8. Limitación de responsabilidad",
      content: "Vendó no es responsable por pérdidas comerciales derivadas del uso o la imposibilidad de uso del servicio. El servicio se provee 'tal cual' sin garantías de disponibilidad continua.",
    },
    {
      title: "9. Cambios en los términos",
      content: "Podemos modificar estos términos con 30 días de aviso previo por email. El uso continuado del servicio implica aceptación de los nuevos términos.",
    },
    {
      title: "10. Contacto",
      content: "Para consultas sobre estos términos, contactanos en legal@vendo.app.",
    },
  ];

  return (
    <div className="min-h-screen bg-surface font-sans">
      <nav className="bg-white border-b border-border px-10 py-4 flex items-center gap-4">
        <Link href="/" className="font-serif text-xl text-ink">vend<span className="text-green">ó</span></Link>
        <span className="text-ink-muted">/</span>
        <span className="text-sm text-ink-muted">Términos de servicio</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-serif text-4xl text-ink mb-2">Términos de servicio</h1>
        <p className="text-sm text-ink-muted mb-10">Última actualización: {new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</p>

        <div className="space-y-8">
          {sections.map(s => (
            <div key={s.title} className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-semibold text-ink text-base mb-3">{s.title}</h2>
              <p className="text-sm text-ink-soft leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
