// src/lib/plan-gate.ts
import { db } from "./db";

export type Feature =
  | "unlimited_products"
  | "custom_domain"
  | "coupons"
  | "stats_advanced"
  | "api_access"
  | "multiple_branches";

const PLAN_FEATURES: Record<string, Feature[]> = {
  FREE: [],
  STARTER: [],
  PRO: ["unlimited_products", "coupons", "custom_domain", "stats_advanced"],
  EXPERT: ["unlimited_products", "coupons", "custom_domain", "stats_advanced", "api_access", "multiple_branches"],
};

const PLAN_LIMITS: Record<string, { maxProducts: number }> = {
  FREE: { maxProducts: 10 },
  STARTER: { maxProducts: 30 },
  PRO: { maxProducts: Infinity },
  EXPERT: { maxProducts: Infinity },
};

export async function getStorePlan(storeId: string) {
  const subscription = await db.subscription.findUnique({
    where: { storeId },
  });

  if (!subscription) return "FREE";

  // Trial o activo → usar el plan
  if (subscription.status === "ACTIVE" || subscription.status === "TRIALING") {
    return subscription.plan;
  }

  // Trial vencido o cancelado → FREE
  if (subscription.status === "TRIALING" && subscription.trialEnds) {
    if (new Date(subscription.trialEnds) < new Date()) return "FREE";
  }

  return "FREE";
}

export async function canUseFeature(storeId: string, feature: Feature): Promise<boolean> {
  const plan = await getStorePlan(storeId);
  return PLAN_FEATURES[plan]?.includes(feature) ?? false;
}

export async function getPlanLimits(storeId: string) {
  const plan = await getStorePlan(storeId);
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;
}

/** Lanza un error si la feature no está disponible en el plan actual */
export async function requireFeature(storeId: string, feature: Feature) {
  const allowed = await canUseFeature(storeId, feature);
  if (!allowed) {
    throw new Error(`UPGRADE_REQUIRED:${feature}`);
  }
}
