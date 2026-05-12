// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { rateLimit, getIp } from "@/lib/rate-limit";

const createSchema = z.object({
  storeId: z.string(),
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  customerNote: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      qty: z.number().int().positive(),
    })
  ).min(1),
});

// POST /api/orders — crea un pedido (llamado desde la tienda pública)
export async function POST(req: NextRequest) {
  // Rate limit: 10 pedidos por IP cada 5 minutos
  const ip = getIp(req);
  const { success } = rateLimit(`orders:${ip}`, { limit: 10, windowMs: 5 * 60 * 1000 });
  if (!success) {
    return NextResponse.json(
      { success: false, error: "Demasiadas solicitudes. Esperá unos minutos." },
      { status: 429 }
    );
  }
  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    // Verificar que la tienda existe y está activa
    const store = await db.store.findFirst({
      where: { id: data.storeId, active: true },
    });
    if (!store) {
      return NextResponse.json({ success: false, error: "Tienda no encontrada" }, { status: 404 });
    }

    // Obtener productos y validar disponibilidad
    const productIds = data.items.map((i) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, storeId: data.storeId, available: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, error: "Uno o más productos no están disponibles" },
        { status: 400 }
      );
    }

    // Calcular total
    const total = data.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return sum + product.price * item.qty;
    }, 0);

    // Verificar pedido mínimo
    if (total < (store.minOrder ?? 0)) {
      return NextResponse.json(
        { success: false, error: `Pedido mínimo: $${store.minOrder}` },
        { status: 400 }
      );
    }

    // Número de pedido autoincremental por tienda
    const lastOrder = await db.order.findFirst({
      where: { storeId: data.storeId },
      orderBy: { number: "desc" },
    });
    const number = (lastOrder?.number ?? 0) + 1;

    const order = await db.order.create({
      data: {
        storeId: data.storeId,
        number,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerNote: data.customerNote,
        total,
        items: {
          create: data.items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            return {
              productId: item.productId,
              name: product.name,
              price: product.price,
              qty: item.qty,
            };
          }),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("[ORDERS POST]", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

// GET /api/orders?storeId=xxx — para el panel admin
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  const status = searchParams.get("status");

  if (!storeId) {
    return NextResponse.json({ success: false, error: "storeId requerido" }, { status: 400 });
  }

  // Verificar que la tienda pertenece al usuario
  const store = await db.store.findFirst({
    where: { id: storeId, userId: session.user.id },
  });
  if (!store) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
  }

  const orders = await db.order.findMany({
    where: {
      storeId,
      ...(status ? { status: status as any } : {}),
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ success: true, data: orders });
}
