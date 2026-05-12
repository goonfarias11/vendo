// src/app/api/stores/[id]/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(1),
  emoji: z.string().optional(),
  position: z.number().int().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const categories = await db.category.findMany({
    where: { storeId: params.id, active: true },
    orderBy: { position: "asc" },
  });
  return NextResponse.json({ success: true, data: categories });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }

  const store = await db.store.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!store) {
    return NextResponse.json({ success: false, error: "No encontrado" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const last = await db.category.findFirst({
      where: { storeId: params.id },
      orderBy: { position: "desc" },
    });

    const category = await db.category.create({
      data: {
        storeId: params.id,
        name: data.name,
        emoji: data.emoji,
        position: data.position ?? (last?.position ?? -1) + 1,
      },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
