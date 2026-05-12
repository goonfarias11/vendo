// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { toCents } from "@/lib/utils";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  categoryId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  emoji: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
  available: z.boolean().optional(),
  featured: z.boolean().optional(),
});

// PATCH /api/products/[id]
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

    // Verificar propiedad
    const product = await db.product.findFirst({
      where: { id: params.id, store: { userId: session.user.id } },
    });
    if (!product) {
      return NextResponse.json({ success: false, error: "No encontrado" }, { status: 404 });
    }

    const updated = await db.product.update({
      where: { id: params.id },
      data: {
        ...data,
        price: data.price !== undefined ? toCents(data.price) : undefined,
      },
      include: { category: true },
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

// DELETE /api/products/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }

  const product = await db.product.findFirst({
    where: { id: params.id, store: { userId: session.user.id } },
  });
  if (!product) {
    return NextResponse.json({ success: false, error: "No encontrado" }, { status: 404 });
  }

  await db.product.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true, data: { deleted: true } });
}
