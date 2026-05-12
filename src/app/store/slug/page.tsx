// src/app/s/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { StoreClient } from "@/components/store/store-client";

interface Props {
  params: { slug: string };
}

// Generar metadata dinámica para SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await db.store.findUnique({
    where: { slug: params.slug, active: true },
  });

  if (!store) return { title: "Tienda no encontrada" };

  return {
    title: `${store.name} — Pedidos por WhatsApp`,
    description: store.description ?? `Hacé tu pedido a ${store.name} por WhatsApp.`,
    openGraph: {
      title: store.name,
      description: store.description ?? "",
      images: store.bannerUrl ? [store.bannerUrl] : [],
    },
  };
}

export default async function StorePage({ params }: Props) {
  const store = await db.store.findUnique({
    where: { slug: params.slug, active: true },
    include: {
      products: {
        where: { available: true },
        include: { category: true },
        orderBy: [{ position: "asc" }, { featured: "desc" }],
      },
      categories: {
        where: { active: true },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!store) notFound();

  return <StoreClient store={store} />;
}
