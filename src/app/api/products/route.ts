// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { toCents } from "@/lib/utils";

const createSchema = z.object({
  storeId: z.string(),
  name: z.string().min(1, "El nombre es obligatorio"),
  price: z.number().positive("El precio debe ser mayor a 0"),
  categoryId: z.string().optional().nullable(),
  description: z.string().optional(),
  emoji: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
});

// GET /api/products?storeId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");

  if (!storeId) {
    return NextResponse.json({ success: false, error: "storeId requerido" }, { status: 400 });
  }

  const products = await db.product.findMany({
    where: { storeId },
    include: { category: true },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ success: true, data: products });
}

// POST /api/products
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    // Verificar que la tienda pertenece al usuario
    const store = await db.store.findFirst({
      where: { id: data.storeId, userId: session.user.id },
    });
    if (!store) {
      return NextResponse.json({ success: false, error: "Tienda no encontrada" }, { status: 404 });
    }

    const product = await db.product.create({
      data: {
        storeId: data.storeId,
        name: data.name,
        price: toCents(data.price),
        categoryId: data.categoryId ?? null,
        description: data.description,
        emoji: data.emoji,
        imageUrl: data.imageUrl ?? null,
        available: data.available,
        featured: data.featured,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("[PRODUCTS POST]", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
