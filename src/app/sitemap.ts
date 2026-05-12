// src/app/sitemap.ts
import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vendo.app";

  // Tiendas activas
  const stores = await db.store.findMany({
    where: { active: true },
    select: { slug: true, updatedAt: true },
  });

  const storeUrls = stores.map(store => ({
    url: `${appUrl}/s/${store.slug}`,
    lastModified: store.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [
    { url: appUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${appUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${appUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...storeUrls,
  ];
}
