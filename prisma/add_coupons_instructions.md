// prisma/migrations/add_coupons.prisma
// Agregá este modelo al schema.prisma existente

// ─────────────────────────────────────────
// CUPONES DE DESCUENTO
// ─────────────────────────────────────────

// model Coupon {
//   id          String      @id @default(cuid())
//   storeId     String
//   code        String      // ej: PROMO20
//   type        CouponType  // PERCENT | FIXED
//   value       Int         // 20 = 20% o 2000 = $20 (en centavos)
//   minOrder    Int         @default(0)
//   maxUses     Int?        // null = ilimitado
//   usedCount   Int         @default(0)
//   active      Boolean     @default(true)
//   expiresAt   DateTime?
//   createdAt   DateTime    @default(now())
//
//   store  Store        @relation(fields: [storeId], references: [id], onDelete: Cascade)
//   uses   CouponUse[]
//
//   @@unique([storeId, code])
//   @@index([storeId])
//   @@map("coupons")
// }
//
// enum CouponType {
//   PERCENT
//   FIXED
// }
//
// model CouponUse {
//   id        String   @id @default(cuid())
//   couponId  String
//   orderId   String   @unique
//   createdAt DateTime @default(now())
//
//   coupon Coupon @relation(fields: [couponId], references: [id])
//   @@map("coupon_uses")
// }

// INSTRUCCIÓN: Pegá los modelos de arriba en prisma/schema.prisma
// y ejecutá: npm run db:push
