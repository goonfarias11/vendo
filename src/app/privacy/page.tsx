// src/app/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Política de privacidad — Vendó" };

export default function PrivacyPage() {
  const sections = [
    {
      title: "Qué datos recopilamos",
      content: [
        "Nombre y email al registrarte",
        "Información de tu negocio (nombre, teléfono, dirección)",
        "Datos de productos y pedidos de tu tienda",
        "Información de pago procesada por Mercado Pago (no almacenamos datos de tarjetas)",
        "Datos de uso del servicio (páginas visitadas, funciones usadas)",
        "Dirección IP y navegador para seguridad",
      ],
    },
    {
      title: "Cómo usamos tus datos",
      content: [
        "Para operar y mejorar el servicio",
        "Enviarte emails transaccionales (bienvenida, alertas de suscripción, notificaciones de pedidos)",
        "Procesar pagos y gestionar tu suscripción",
        "Detectar y prevenir fraudes",
        "Generar estadísticas anónimas de uso del producto",
      ],
    },
    {
      title: "Datos de tus clientes",
      content: [
        "Los datos de tus clientes (nombre, teléfono, pedidos) pertenecen a tu negocio",
        "Los almacenamos para mostrarte el historial de pedidos en tu panel",
        "No los usamos para marketing ni los vendemos a terceros",
        "Podés exportar o eliminar estos datos cuando quieras",
      ],
    },
    {
      title: "Con quién compartimos datos",
      content: [
        "Mercado Pago: para procesar pagos (solo datos necesarios para la transacción)",
        "Cloudinary: para almacenar imágenes de productos",
        "Vercel: hosting de la aplicación",
        "Neon/PostgreSQL: almacenamiento de datos",
        "No vendemos ni alquilamos tus datos a terceros",
      ],
    },
    {
      title: "Seguridad",
      content: [
        "Contraseñas cifradas con bcrypt",
        "Conexiones HTTPS en todo el sitio",
        "Base de datos con acceso restringido",
        "Tokens de sesión seguros con NextAuth",
      ],
    },
    {
      title: "Tus derechos",
      content: [
        "Acceder a todos tus datos personales",
        "Corregir información incorrecta",
        "Solicitar la eliminación de tu cuenta y datos",
        "Exportar tus datos en formato legible",
        "Para ejercer estos derechos: privacidad@vendo.app",
      ],
    },
    {
      title: "Cookies",
      content: [
        "Usamos cookies de sesión para mantenerte logueado",
        "No usamos cookies de rastreo de terceros",
        "No mostramos publicidad",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface font-sans">
      <nav className="bg-white border-b border-border px-10 py-4 flex items-center gap-4">
        <Link href="/" className="font-serif text-xl text-ink">vend<span className="text-green">ó</span></Link>
        <span className="text-ink-muted">/</span>
        <span className="text-sm text-ink-muted">Política de privacidad</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-serif text-4xl text-ink mb-2">Política de privacidad</h1>
        <p className="text-sm text-ink-muted mb-4">Última actualización: {new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</p>
        <div className="bg-green-pale border border-green/20 rounded-2xl px-5 py-4 mb-10">
          <p className="text-sm text-green-dark font-medium">
            En Vendó no vendemos ni compartimos tus datos personales. Punto. Esta política explica exactamente qué recopilamos y por qué.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map(s => (
            <div key={s.title} className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-semibold text-ink text-base mb-3">{s.title}</h2>
              <ul className="space-y-1.5">
                {s.content.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink-soft">
                    <span className="text-green mt-0.5 flex-shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-ink-muted">
          <p>¿Preguntas? Escribinos a <a href="mailto:privacidad@vendo.app" className="text-green font-medium">privacidad@vendo.app</a></p>
        </div>
      </div>
    </div>
  );
}
