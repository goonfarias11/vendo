// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { toSlug } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Nombre muy corto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  storeName: z.string().min(2, "Nombre de tienda muy corto"),
  whatsapp: z.string().min(10, "WhatsApp inválido"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Verificar email único
    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Ya existe una cuenta con ese email" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Generar slug único para la tienda
    let slug = toSlug(data.storeName);
    const slugExists = await db.store.findUnique({ where: { slug } });
    if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;

    // Crear usuario + tienda + suscripción trial en una transacción
    const { user, store } = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
        },
      });

      const newStore = await tx.store.create({
        data: {
          userId: newUser.id,
          name: data.storeName,
          slug,
          whatsapp: data.whatsapp,
        },
      });

      // Trial de 14 días
      await tx.subscription.create({
        data: {
          storeId: newStore.id,
          plan: "FREE",
          status: "TRIALING",
          trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      return { user: newUser, store: newStore };
    });

    // Email de bienvenida (fire-and-forget)
    import("@/lib/email").then(({ sendWelcomeEmail }) => {
      sendWelcomeEmail(user.email!, user.name ?? "Usuario", data.storeName, slug).catch(console.error);
    });

    return NextResponse.json(
      { success: true, data: { userId: user.id } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
