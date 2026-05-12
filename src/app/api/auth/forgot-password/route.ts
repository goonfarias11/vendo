// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

const schema = z.object({ email: z.string().email() });

// Almacén en memoria simple (en producción usá Redis o un modelo DB)
// Para producción real, agregá un modelo PasswordResetToken en Prisma
const resetTokens = new Map<string, { email: string; expiresAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const { email } = schema.parse(await req.json());

    const user = await db.user.findUnique({ where: { email } });

    // Siempre responder OK para no revelar si el email existe
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hora

    resetTokens.set(token, { email, expiresAt });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Email inválido" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

export { resetTokens };
