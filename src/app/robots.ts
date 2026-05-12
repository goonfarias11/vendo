// src/app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vendo.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/s/"],
        disallow: ["/dashboard/", "/api/", "/admin/"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
