// scripts/create-mp-plans.ts
// Ejecutá este script UNA SOLA VEZ para crear los planes en Mercado Pago
// npx tsx scripts/create-mp-plans.ts

import { MercadoPagoConfig, PreApprovalPlan } from "mercadopago";
import * as dotenv from "dotenv";

dotenv.config();

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

const PLANS_TO_CREATE = [
  {
    key: "STARTER",
    reason: "Vendó — Plan Principiante",
    amount: 4900,
    frequency: 1,
    frequencyType: "months" as const,
  },
  {
    key: "PRO",
    reason: "Vendó — Plan Especialista",
    amount: 7900,
    frequency: 1,
    frequencyType: "months" as const,
  },
  {
    key: "EXPERT",
    reason: "Vendó — Plan Pro",
    amount: 12900,
    frequency: 1,
    frequencyType: "months" as const,
  },
];

async function main() {
  const planApi = new PreApprovalPlan(mp);

  console.log("🔧 Creando planes en Mercado Pago...\n");

  for (const plan of PLANS_TO_CREATE) {
    const result = await planApi.create({
      body: {
        reason: plan.reason,
        auto_recurring: {
          frequency: plan.frequency,
          frequency_type: plan.frequencyType,
          transaction_amount: plan.amount,
          currency_id: "ARS",
        },
        payment_methods_allowed: {
          payment_types: [{ id: "credit_card" }, { id: "debit_card" }],
        },
        back_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
      },
    });

    console.log(`✅ ${plan.key}:`);
    console.log(`   ID: ${result.id}`);
    console.log(`   Agregá al .env: MP_PLAN_${plan.key}_ID="${result.id}"\n`);
  }

  console.log("🎉 Listo! Copiá los IDs al .env y redeploy.");
}

main().catch(console.error);
