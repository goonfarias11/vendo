// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Usuario demo
  const password = await bcrypt.hash("demo1234", 12);

  const user = await db.user.upsert({
    where: { email: "demo@vendo.app" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@vendo.app",
      password,
    },
  });

  // Tienda demo
  const store = await db.store.upsert({
    where: { slug: "lacroissanteria" },
    update: {},
    create: {
      userId: user.id,
      slug: "lacroissanteria",
      name: "La Croissantería",
      description: "Medialunas recién salidas del horno desde 1987. Abrimos de lunes a sábado de 7 a 20hs.",
      category: "Panadería",
      whatsapp: "5491199998888",
      address: "Av. Cabildo 1234",
      city: "Buenos Aires",
      primaryColor: "#0ABF6E",
      minOrder: 50000, // $500 en centavos
    },
  });

  // Suscripción trial
  await db.subscription.upsert({
    where: { storeId: store.id },
    update: {},
    create: {
      storeId: store.id,
      plan: "FREE",
      status: "TRIALING",
      trialEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  // Categorías
  const categories = await Promise.all([
    db.category.upsert({
      where: { id: "cat-panaderia" },
      update: {},
      create: { id: "cat-panaderia", storeId: store.id, name: "Panadería", emoji: "🥐", position: 0 },
    }),
    db.category.upsert({
      where: { id: "cat-sandwiches" },
      update: {},
      create: { id: "cat-sandwiches", storeId: store.id, name: "Sandwiches", emoji: "🥪", position: 1 },
    }),
    db.category.upsert({
      where: { id: "cat-bebidas" },
      update: {},
      create: { id: "cat-bebidas", storeId: store.id, name: "Bebidas", emoji: "☕", position: 2 },
    }),
    db.category.upsert({
      where: { id: "cat-dulces" },
      update: {},
      create: { id: "cat-dulces", storeId: store.id, name: "Dulces", emoji: "🧁", position: 3 },
    }),
  ]);

  const [panaderia, sandwiches, bebidas, dulces] = categories;

  // Productos
  const products = [
    { name: "Medialuna de manteca", price: 35000, categoryId: panaderia.id, emoji: "🥐", featured: true },
    { name: "Medialuna de grasa", price: 30000, categoryId: panaderia.id, emoji: "🥐" },
    { name: "Medialunas x6", price: 180000, categoryId: panaderia.id, emoji: "🥐" },
    { name: "Croissant de jamón y queso", price: 98000, categoryId: sandwiches.id, emoji: "🥪", featured: true },
    { name: "Tostado mixto", price: 120000, categoryId: sandwiches.id, emoji: "🥪" },
    { name: "Café con leche", price: 89000, categoryId: bebidas.id, emoji: "☕", featured: true },
    { name: "Jugo de naranja", price: 75000, categoryId: bebidas.id, emoji: "🍊" },
    { name: "Té con limón", price: 68000, categoryId: bebidas.id, emoji: "🫖" },
    { name: "Muffin de arándanos", price: 65000, categoryId: dulces.id, emoji: "🧁" },
    { name: "Brownie de chocolate", price: 72000, categoryId: dulces.id, emoji: "🍫", featured: true },
  ];

  for (const [i, product] of products.entries()) {
    await db.product.upsert({
      where: { id: `prod-${i}` },
      update: {},
      create: {
        id: `prod-${i}`,
        storeId: store.id,
        position: i,
        description: "Hecho en el día con los mejores ingredientes.",
        featured: product.featured ?? false,
        ...product,
      },
    });
  }

  console.log("✅ Seed completo!");
  console.log("📧 Email: demo@vendo.app");
  console.log("🔑 Password: demo1234");
  console.log("🏪 Tienda: /s/lacroissanteria");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
