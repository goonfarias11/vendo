// src/app/dashboard/products/page.tsx
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProductsManager } from "@/components/admin/products-manager";

export const metadata = { title: "Productos" };

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await db.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: { storeId: store.id },
      include: { category: true },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    }),
    db.category.findMany({
      where: { storeId: store.id },
      orderBy: { position: "asc" },
    }),
  ]);

  return (
    <ProductsManager
      initialProducts={products}
      categories={categories}
      storeId={store.id}
    />
  );
}
