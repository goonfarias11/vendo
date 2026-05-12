// src/app/layout.tsx
import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vendó — Tu tienda, tus pedidos, tu WhatsApp",
    template: "%s | Vendó",
  },
  description:
    "Creá tu catálogo digital en minutos. Tus clientes eligen, vos recibís el pedido armado directo en WhatsApp. Sin comisiones, sin apps.",
  keywords: ["tienda online", "whatsapp", "catálogo digital", "pedidos", "argentina"],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Vendó",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${dmSans.variable} ${instrumentSerif.variable}`}>
      <body className="font-sans antialiased bg-white text-ink">{children}</body>
    </html>
  );
}
