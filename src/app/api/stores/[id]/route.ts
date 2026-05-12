// src/app/api/stores/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { toSlug } from "@/lib/utils";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  whatsapp: z.string().min(10).optional(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  minOrder: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const store = await db.store.findFirst({
      where: { id: params.id, userId: session.user.id },
    });
    if (!store) {
      return NextResponse.json({ success: false, error: "Tienda no encontrada" }, { status: 404 });
    }

    // Verificar slug único si cambió
    if (data.slug && data.slug !== store.slug) {
      const slug = toSlug(data.slug);
      const exists = await db.store.findFirst({
        where: { slug, NOT: { id: params.id } },
      });
      if (exists) {
        return NextResponse.json(
          { success: false, error: "Ese link ya está en uso, elegí otro" },
          { status: 409 }
        );
      }
      data.slug = slug;
    }

    const updated = await db.store.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
