// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendWhatsAppNotification } from "@/lib/whatsapp-notify";

const updateSchema = z.object({
  status: z.enum(["NEW", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"]),
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
    const { status } = updateSchema.parse(body);

    const order = await db.order.findFirst({
      where: { id: params.id, store: { userId: session.user.id } },
      include: { items: true, store: true },
    });
    if (!order) {
      return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 });
    }

    const updated = await db.order.update({
      where: { id: params.id },
      data: { status },
      include: { items: true },
    });

    // Enviar notificación por WhatsApp si el cliente dejó su número
    const notifyStatuses = ["CONFIRMED", "PREPARING", "READY", "DELIVERED"] as const;
    if (order.customerPhone && notifyStatuses.includes(status as any)) {
      // Fire-and-forget, no esperamos la respuesta
      sendWhatsAppNotification({
        customerPhone: order.customerPhone,
        customerName: order.customerName,
        orderNumber: order.number,
        storeName: order.store.name,
        items: order.items.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
        total: order.total,
        status: status as any,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
