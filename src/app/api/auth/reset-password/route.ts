// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { resetTokens } from "../forgot-password/route";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export async function POST(req: NextRequest) {
  try {
    const { token, password } = schema.parse(await req.json());

    const record = resetTokens.get(token);
    if (!record || Date.now() > record.expiresAt) {
      return NextResponse.json(
        { success: false, error: "Token inválido o vencido" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    await db.user.update({
      where: { email: record.email },
      data: { password: hashed },
    });

    resetTokens.delete(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
