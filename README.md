# Vendó — SaaS de catálogos digitales con WhatsApp

Plataforma para que comercios creen su tienda online y reciban pedidos directamente por WhatsApp. Sin comisiones, sin apps.

## Stack tecnológico

| Capa | Tecnología | Por qué |
|---|---|---|
| Framework | Next.js 14 (App Router) | Fullstack, SSR, API routes, todo en uno |
| Base de datos | PostgreSQL + Prisma | Relacional, tipado, migraciones automáticas |
| Auth | NextAuth v5 | Email/password + Google, JWT sessions |
| Imágenes | Cloudinary | CDN gratis, transformaciones on-the-fly |
| Pagos | Mercado Pago | Ideal para Latam, suscripciones incluidas |
| Estado cliente | Zustand | Liviano, persistente (carrito) |
| Estilos | Tailwind CSS | Utility-first, fácil de customizar |
| Deploy | Vercel | Gratis para empezar, escala solo |

---

## Estructura del proyecto

```
vendo/
├── prisma/
│   ├── schema.prisma        # Modelos de BD: Users, Stores, Products, Orders
│   └── seed.ts              # Datos de prueba
│
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Layout raíz (fuentes, metadata)
│   │   ├── page.tsx         # Landing page (marketing)
│   │   │
│   │   ├── s/[slug]/        # 🏪 Tienda pública: vendo.app/s/mitienda
│   │   │   └── page.tsx
│   │   │
│   │   ├── dashboard/       # 🔐 Panel admin (protegido con auth)
│   │   │   ├── layout.tsx   # Auth guard + sidebar
│   │   │   ├── page.tsx     # Dashboard con stats
│   │   │   ├── products/    # Gestión de productos
│   │   │   ├── orders/      # Centro de pedidos
│   │   │   ├── store/       # Configuración de tienda
│   │   │   └── stats/       # Estadísticas avanzadas
│   │   │
│   │   └── api/
│   │       ├── auth/        # Register, NextAuth handlers
│   │       ├── products/    # CRUD productos
│   │       ├── orders/      # Crear y gestionar pedidos
│   │       └── stores/      # Configuración de tienda
│   │
│   ├── components/
│   │   ├── ui/              # Botones, inputs, modales reutilizables
│   │   ├── store/           # Catálogo, carrito, checkout WA
│   │   ├── admin/           # Sidebar, tablas, formularios
│   │   └── landing/         # Hero, features, pricing
│   │
│   ├── lib/
│   │   ├── db.ts            # Prisma client singleton
│   │   ├── auth.ts          # NextAuth config
│   │   └── utils.ts         # formatPrice, buildWAMessage, toSlug...
│   │
│   ├── hooks/
│   │   └── use-cart.ts      # Zustand store del carrito (persistente)
│   │
│   └── types/
│       └── index.ts         # Tipos TypeScript compartidos
│
├── .env.example             # Variables de entorno requeridas
├── next.config.ts           # Rewrites para subdominios custom
├── tailwind.config.ts       # Tokens de diseño de Vendó
└── package.json
```

---

## Setup local (5 minutos)

### 1. Clonar e instalar

```bash
git clone https://github.com/tu-usuario/vendo.git
cd vendo
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

Completá las variables en `.env`:

- **DATABASE_URL**: Creá una base gratis en [neon.tech](https://neon.tech)
- **NEXTAUTH_SECRET**: `openssl rand -base64 32`
- **Cloudinary**: Cuenta gratis en [cloudinary.com](https://cloudinary.com)
- **Mercado Pago**: Credenciales de prueba en [developers.mercadopago.com](https://developers.mercadopago.com)

### 3. Base de datos

```bash
npm run db:push      # Crea las tablas
npm run db:seed      # Carga datos de prueba
```

### 4. Correr el proyecto

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

### Cuentas de prueba

| Rol | Email | Password |
|---|---|---|
| Admin | demo@vendo.app | demo1234 |

| URL | Descripción |
|---|---|
| `/` | Landing page |
| `/dashboard` | Panel admin |
| `/s/lacroissanteria` | Tienda pública de demo |

---

## Deploy en Vercel

```bash
npm i -g vercel
vercel
```

1. Conectá tu repo de GitHub en [vercel.com](https://vercel.com)
2. Agregá las variables de entorno en Settings → Environment Variables
3. Cambiá `NEXTAUTH_URL` a tu dominio de producción

---

## Roadmap

### MVP (ya implementado)
- [x] Landing page
- [x] Registro y autenticación
- [x] Panel admin (productos, pedidos, config de tienda)
- [x] Tienda pública con carrito
- [x] Pedidos por WhatsApp

### v1.1
- [ ] Subida de imágenes con Cloudinary
- [ ] Estadísticas con gráficos
- [ ] Cupones de descuento
- [ ] Múltiples categorías arrastrables

### v1.2
- [ ] Suscripciones con Mercado Pago
- [ ] Dominio personalizado por tienda
- [ ] Notificaciones de pedidos por WhatsApp Business API
- [ ] Multiple sucursales (plan Pro)

### v2.0
- [ ] App móvil (React Native)
- [ ] Integración con Instagram Shopping
- [ ] Analytics avanzados
- [ ] API pública para integraciones

---

## Modelos de datos clave

```
User ──< Store ──< Product ──> Category
                └──< Order ──< OrderItem
                └── Subscription
```

---

## Contribuir

1. Fork del repo
2. `git checkout -b feature/mi-feature`
3. `git commit -m "feat: descripción"`
4. Pull request

---

Hecho con ❤️ para comercios de Latinoamérica.
