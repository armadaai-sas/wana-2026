# Waná Infrastructure

Use this file as the entry point for deployment and environment-specific work.

## Phase 0 stack (current — non-serverless foundation)

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Primary database (replaces Supabase DB for new booking flow) |
| Redis | 6379 | Queues, rate limits (future workers) |
| MinIO | 9000 / 9001 | Object storage for images/video |
| Waná API | 4000 | Fastify REST API (`api/`) |
| Next.js web | 3000 | Frontend SSR (`output: standalone`) |

### Quick start (local)

```bash
# 1. Infrastructure
npm run docker:infra

# 2. API setup (first time)
cd api && cp .env.example .env && npm install
npm run db:migrate && npm run db:seed

# 3. Run services
npm run api:dev          # API on :4000
npm run dev              # Web on :3000
```

Or all-in-docker: `npm run docker:up`

### API endpoints (v1)

- `GET /health`
- `GET /api/v1/properties`
- `GET /api/v1/properties/:slug`
- `GET /api/v1/properties/:id/availability`
- `POST /api/v1/bookings/quote`
- `POST /api/v1/bookings`
- `GET /api/v1/bookings/:id`
- `POST /api/v1/payments/intent` — Bold o Stripe
- `GET /api/v1/payments/:id`
- `POST /api/v1/payments/:id/sync` — polling post-redirect
- `POST /api/v1/payments/:id/mock-complete` — solo `PAYMENTS_MODE=mock`
- `POST /api/v1/webhooks/bold`
- `POST /api/v1/webhooks/stripe`
- `POST /api/v1/auth/register` · `POST /api/v1/auth/login` · `GET /api/v1/auth/me`

### Auth (JWT)

- Header: `Authorization: Bearer <token>`
- Cookie web: `wana_token` (middleware protege `/host`, `/account`, `/admin`)
- Demo: `guest@wana.local`, `host@wana.local`, `admin@wana.local` / `wana12345`

### Pagos (Fase 2)

| Proveedor | Uso | Env vars |
|-----------|-----|----------|
| **Bold** | Colombia, COP | `BOLD_API_KEY`, `BOLD_WEBHOOK_SECRET` |
| **Stripe** | Internacional, USD | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **Mock** | Local sin keys | `PAYMENTS_MODE=mock` en `api/.env` |

Webhooks en producción: apuntar Bold/Stripe a `https://tu-dominio/api/v1/webhooks/bold` y `/stripe`.

### Media (Fase 3 — MinIO)

| Endpoint | Uso |
|----------|-----|
| `POST /api/v1/media/upload` | Multipart: `property_id`, `file` + header `X-Host-Id` |
| `GET /api/v1/media/property/:id` | Lista media de propiedad |
| `DELETE /api/v1/media/:id` | Eliminar (host) |
| `GET /api/v1/host/:hostId/properties` | Dashboard anfitrión |

Requiere MinIO (`npm run docker:infra`). Imágenes → WebP + thumbnails (sharp). Videos → MP4/WebM directo.

### Marketing (Fase 4)

| Componente | Ubicación |
|------------|-----------|
| GA4 + Meta Pixel + GTM | `components/analytics/MarketingScripts.tsx` |
| Eventos cliente | `lib/analytics.ts` — view_item, begin_checkout, purchase |
| SEO | `app/sitemap.ts`, `app/robots.ts`, `PropertyJsonLd` |
| Email confirmación | API `marketing.ts` — Resend o log en dev |
| Meta CAPI (server) | API al confirmar pago — `META_PIXEL_ID`, `META_ACCESS_TOKEN` |

Web env: `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_SITE_URL`

### Facturación Alegra (Fase 6B)

| Endpoint | Uso |
|----------|-----|
| Auto post-pago | `invoicing.ts` — emite factura COP al confirmar pago |
| `GET /api/v1/admin/invoices/pending` | Lista facturas pendientes/fallidas (admin JWT) |
| `POST /api/v1/admin/invoices/:id/retry` | Reintento manual |

Env: `ALEGRA_EMAIL`, `ALEGRA_API_TOKEN`. Sin credenciales → `pending_invoices` para procesamiento posterior. Pagos USD (Stripe internacional) no facturan en Alegra.

### Database

- Schema: `api/prisma/schema.prisma`
- Migrations: `api/prisma/migrations/`
- Unified model: `properties` (replaces legacy `domos` + `properties` split)

## Legacy stack (removed Jul 2026)

- ~~Supabase client, server actions, Next `/api/*` stubs~~ — eliminado; usar solo Fastify `/api/v1`
- **Netlify:** `netlify.toml` — optional; producción usa Docker
- **Pagos mock:** checkout vía `wanaApi` + API Fastify

## Environment

- Web: copy `.env.example` → `.env.local`
- API: copy `api/.env.example` → `api/.env`
- `NEXT_PUBLIC_API_URL=http://localhost:4000`

## Deployment (production)

- **Guía principal:** `deploy/DEPLOYMENT_PRODUCTION.md`
- Stack: `docker compose -f docker-compose.prod.yml --env-file .env.production up -d`
- Template env: `deploy/.env.production.example`
- Backups: `deploy/scripts/backup-db.sh`
- Cloudflare CDN in front of Nginx + MinIO
- Roadmap: `ROADMAP.md`

## Health checks

- API: `curl http://localhost:4000/health`
- Web: `app/health/`, `app/heartbeat/`

## Agent rule

For deployment tasks, start here. For booking/payment work, use the new API + Prisma schema first.
