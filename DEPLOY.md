# 🚀 Guía de Deploy — Vendó en Vercel

Tiempo estimado: **20–30 minutos**. Todo gratis para empezar.

---

## Paso 1 — Subir el código a GitHub

```bash
# Descomprimí el proyecto
unzip vendo-complete.zip && cd vendo

# Iniciá git
git init
git add .
git commit -m "feat: initial Vendó SaaS setup"

# Creá un repo en github.com y conectalo
git remote add origin https://github.com/TU_USUARIO/vendo.git
git push -u origin main
```

---

## Paso 2 — Base de datos PostgreSQL (Neon — gratis)

1. Entrá a **https://neon.tech** y creá una cuenta
2. Creá un nuevo proyecto → elegí la región más cercana (ej: `aws-sa-east-1` para Argentina)
3. Copiá la **Connection String** que dice `postgresql://...`
4. Guardala, la vas a necesitar en el Paso 4

---

## Paso 3 — Cloudinary para imágenes (gratis hasta 25GB)

1. Entrá a **https://cloudinary.com** y creá una cuenta
2. En el Dashboard copiá:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## Paso 4 — Deploy en Vercel

### 4a. Importar el proyecto

1. Entrá a **https://vercel.com/new**
2. Conectá tu cuenta de GitHub
3. Elegí el repo `vendo`
4. En **Framework Preset** seleccioná `Next.js`
5. **NO hagas clic en Deploy todavía** — primero configurá las env vars

### 4b. Variables de entorno

En la sección **Environment Variables** agregá:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | La connection string de Neon |
| `NEXTAUTH_SECRET` | Un string aleatorio (usá: `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://TU-PROYECTO.vercel.app` (lo sabés después del primer deploy) |
| `CLOUDINARY_CLOUD_NAME` | El de tu cuenta Cloudinary |
| `CLOUDINARY_API_KEY` | El de tu cuenta Cloudinary |
| `CLOUDINARY_API_SECRET` | El de tu cuenta Cloudinary |
| `NEXT_PUBLIC_APP_URL` | `https://TU-PROYECTO.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | `Vendó` |

### 4c. Deploy

Hacé clic en **Deploy**. Vercel va a construir el proyecto (2–3 minutos).

---

## Paso 5 — Inicializar la base de datos

Una vez que el deploy terminó, ejecutá desde tu máquina local:

```bash
# Copiá tu DATABASE_URL de Neon en el .env local
echo 'DATABASE_URL="postgresql://..."' > .env

# Crear las tablas
npm run db:push

# Cargar datos de prueba (opcional)
npm run db:seed
```

O desde la consola de Neon podés ejecutar el SQL directamente.

---

## Paso 6 — Actualizar NEXTAUTH_URL

Después del primer deploy, Vercel te da una URL como `vendo-abc123.vercel.app`.

1. Entrá a **Vercel → Settings → Environment Variables**
2. Actualizá `NEXTAUTH_URL` y `NEXT_PUBLIC_APP_URL` con esa URL real
3. Hacé un nuevo deploy (o esperá el próximo push)

---

## Paso 7 — Dominio personalizado (opcional)

1. Vercel → Settings → Domains
2. Agregá tu dominio (ej: `vendo.app` o `miapp.com`)
3. Configurá los DNS según te indica Vercel:
   - **A record**: apunta a `76.76.21.21`
   - **CNAME**: `www` apunta a `cname.vercel-dns.com`

---

## Variables opcionales para más funciones

```bash
# Google OAuth (login con Google)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
# Crealo en: https://console.cloud.google.com → APIs & Services → Credentials

# Mercado Pago (suscripciones de pago)
MP_ACCESS_TOKEN=""
MP_PUBLIC_KEY=""
MP_WEBHOOK_SECRET=""
# Crealo en: https://developers.mercadopago.com
```

---

## Comandos útiles post-deploy

```bash
# Ver logs en tiempo real
vercel logs --follow

# Deploy manual desde terminal
vercel --prod

# Abrir el proyecto en el browser
vercel open

# Variables de entorno desde CLI
vercel env pull .env.local
```

---

## Checklist final ✅

- [ ] Código en GitHub
- [ ] Base de datos Neon creada y URL copiada
- [ ] Cloudinary configurado
- [ ] Variables de entorno en Vercel
- [ ] Primer deploy exitoso
- [ ] `npm run db:push` ejecutado
- [ ] `NEXTAUTH_URL` actualizada con URL real
- [ ] Cuenta de prueba verificada: `demo@vendo.app` / `demo1234`
- [ ] Tienda de demo visible en `/s/lacroissanteria`

---

## Estructura de URLs en producción

| URL | Descripción |
|---|---|
| `tuapp.vercel.app/` | Landing page |
| `tuapp.vercel.app/login` | Login |
| `tuapp.vercel.app/register` | Registro |
| `tuapp.vercel.app/dashboard` | Panel admin |
| `tuapp.vercel.app/s/[slug]` | Tienda pública |
| `tuapp.vercel.app/api/...` | API REST |

---

## Solución de problemas frecuentes

**Error: `PrismaClientInitializationError`**
→ `DATABASE_URL` no está bien configurada. Verificá que tenga `?sslmode=require` al final.

**Error: `NEXTAUTH_SECRET` not set**
→ Agregá la variable en Vercel y redeploy.

**Las imágenes no suben**
→ Verificá las credenciales de Cloudinary. El Cloud Name no lleva `https://`.

**Login con Google no funciona**
→ En Google Console, agregá `https://tuapp.vercel.app/api/auth/callback/google` a los Authorized redirect URIs.

**`npm run db:push` falla**
→ Asegurate de que la DATABASE_URL en tu `.env` local apunte a Neon (no a localhost).
