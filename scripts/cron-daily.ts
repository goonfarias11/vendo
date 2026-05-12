// scripts/cron-daily.ts
// Ejecutar diariamente via cron en Vercel o un scheduler externo
// Configurá en vercel.json o usá https://cron-job.org (gratis)
// Llamar: GET /api/cron/daily?secret=TU_CRON_SECRET

import * as dotenv from "dotenv";
dotenv.config();

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET ?? "";

async function main() {
  console.log("🕐 Ejecutando cron diario...");
  const res = await fetch(`${APP_URL}/api/cron/daily?secret=${CRON_SECRET}`);
  const data = await res.json();
  console.log("Resultado:", data);
}

main().catch(console.error);
