// src/app/onboarding/page.tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { OnboardingClient } from "@/components/admin/onboarding-client";

export const metadata = { title: "Empezar con Vendó" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await db.store.findFirst({
    where: { userId: session.user.id },
    include: {
      products: { select: { id: true }, take: 1 },
      categories: { select: { id: true }, take: 1 },
    },
  });

  if (!store) redirect("/register");

  const steps = {
    hasProducts: store.products.length > 0,
    hasCategories: store.categories.length > 0,
    hasWhatsapp: !!store.whatsapp,
    hasDescription: !!store.description,
    hasLogo: !!store.logoUrl,
  };

  const completed = Object.values(steps).filter(Boolean).length;
  const total = Object.keys(steps).length;

  // Si ya completó el onboarding, mandar al dashboard
  if (completed === total) redirect("/dashboard");

  return (
    <OnboardingClient
      store={{ id: store.id, name: store.name, slug: store.slug }}
      steps={steps}
      completed={completed}
      total={total}
    />
  );
}
