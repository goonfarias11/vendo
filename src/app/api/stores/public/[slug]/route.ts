// src/app/api/stores/[id]/route.ts - already exists for PATCH
// src/app/api/stores/public/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit, getIp } from "@/lib/rate-limit";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { success } = rateLimit(`store-info:${getIp(req)}`, { limit: 60, windowMs: 60_000 });
  if (!success) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const store = await db.store.findUnique({
    where: { slug: params.slug, active: true },
    select: {
      id: true, name: true, slug: true, description: true,
      category: true, primaryColor: true, whatsapp: true,
      minOrder: true, address: true, city: true, logoUrl: true,
    },
  });

  if (!store) return NextResponse.json({ success: false, error: "Tienda no encontrada" }, { status: 404 });

  return NextResponse.json({ success: true, data: store });
}
