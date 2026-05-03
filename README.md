# Shakti Supplies — B2B cleaning procurement platform

Production-oriented **Next.js 15 App Router** stack for Indian B2B buyers: Firebase **phone OTP**, **Prisma + Supabase Postgres**, tier-aware pricing / MOQ validation, GST-ready **order snapshots**, dual **customer + admin** experiences, and **Vercel**-friendly configuration.

## Tech stack

| Layer | Choice |
|--------|--------|
| Framework | Next.js 15 (App Router), TypeScript |
| UI | Tailwind CSS v4, shadcn/ui (Base UI primitives), lucide-react |
| Database | PostgreSQL on **Supabase** |
| ORM | Prisma 6 |
| Customer auth | Firebase **Phone Auth** → verified ID token → HTTP-only JWT session |
| Admin auth | Email + bcrypt password (`admin_users`) → HTTP-only JWT |
| Hosting | Vercel (see deployment) |

## Folder structure

```
src/
├── app/
│   ├── (customer)/          # Storefront (shared chrome: header, sticky cart, WhatsApp)
│   │   ├── page.tsx         # Home + featured + categories
│   │   ├── catalog/         # Search / filters / grid
│   │   ├── product/[slug]/  # PDP + add-to-cart (MOQ / step qty)
│   │   ├── login/           # Firebase OTP (Suspense-wrapped search params)
│   │   ├── register/        # GSTIN + business profile completion
│   │   ├── cart/, checkout/, checkout/success/
│   │   ├── orders/, orders/[id]/
│   │   ├── addresses/, profile/
│   ├── admin/               # Dashboard (layout skips chrome on /admin/login)
│   │   ├── login/
│   │   ├── page.tsx         # KPIs + recent orders + OrderAlertPoller (sound)
│   │   ├── orders/, customers/, categories/, products/, inventory/
│   ├── api/                 # REST handlers (customers + admin namespaces)
│   ├── layout.tsx           # Root fonts + Providers + Sonner
│   └── globals.css
├── components/
│   ├── ui/                  # shadcn components
│   ├── layout/              # ClientChrome, AdminChrome
│   ├── catalog/, admin/
├── lib/                     # prisma, auth/session, pricing, catalog serializers, Supabase upload
├── middleware.ts            # JWT gates for /admin/* (pages) + customer routes
prisma/
├── schema.prisma            # Full schema (users, addresses, cart, tiers, orders…)
├── seed.ts                  # Categories, demo SKUs + tiers, admin user
.env.example
```

## Environment variables

Copy `.env.example` → `.env.local` for development and configure **all** secrets before running authenticated flows.

**Vercel:** Project → Settings → Environment Variables — paste the same keys for Preview + Production.

Minimum to run locally:

1. `DATABASE_URL` + `DIRECT_URL` (Supabase)
2. `JWT_SECRET` (≥16 chars in production)
3. Firebase Admin + Web keys (OTP)
4. Optional: Supabase Storage keys for admin image uploads; WhatsApp E.164 vars for deep links.

## Supabase (PostgreSQL) setup

1. Create a project at [supabase.com](https://supabase.com).
2. **Settings → Database → Connection string**
   - Use the **Transaction pooler** URI for `DATABASE_URL` (PgBouncer / port `6543`) — ideal for serverless (Vercel).
   - Use the **direct** URI for `DIRECT_URL` (port `5432`) for migrations (`prisma migrate`).
3. (Optional) **Storage:** create a **public** bucket named `product-images` (or override `SUPABASE_PRODUCT_BUCKET`). Service role key is server-only (`SUPABASE_SERVICE_ROLE_KEY`).

## Firebase OTP setup

1. In [Firebase Console](https://console.firebase.google.com/), enable **Authentication → Sign-in method → Phone**.
2. Add a **Web app** and copy the config into `NEXT_PUBLIC_FIREBASE_*` vars.
3. For **Admin SDK**, download a service account JSON and map:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (escape newlines as `\n` inside the env string)

**India-specific:** Firebase SMS templates and delivery characteristics vary by carrier; use Firebase test numbers during development.

## Database migrations & seed

```bash
# Install deps
npm install

# Push schema (quick start — dev/prototype)
npm run db:push

# Or create a migration (team workflows)
npm run db:migrate

# Seed demo categories, SKUs + tiers, admin login
npm run db:seed
```

Default **admin** account created by seed:

- Email: `admin@cleaningb2b.demo`
- Password: `Admin@12345`

Change immediately in production (update hash in DB or rotate seed).

## Local development

```bash
npm run dev
```

Visit `http://localhost:3000` — storefront; admin console at `/admin/login`.

## Vercel deployment

1. Push the repo and **Import** into Vercel.
2. Set **all** environment variables from `.env.example`.
3. Build command: `npm run build` (already runs `prisma generate`).
4. Ensure **DATABASE_URL** uses Supabase **pooler** URL on Vercel; keep **DIRECT_URL** for migrations run from CI or local machine.
5. Recommended: run migrations against production from a trusted environment:

```bash
DATABASE_URL="…pooler…" DIRECT_URL="…direct…" npx prisma migrate deploy
```

6. Optional post-deploy seed (staging only):

```bash
npm run db:seed
```

## Feature map

**Customer**

- OTP login → profile capture with **GSTIN** validation pattern
- Multiple addresses, default ship-to
- Catalogue with categories, search, featured toggle
- PDP tier table + MOQ / step qty cart enforcement + stock badges (**low stock** threshold via env)
- Checkout notes (**customerNotes** persisted on orders)
- Order history + **reorder** (best-effort stock/MOQ normalization)
- WhatsApp **support** FAB + optional **business WhatsApp** link after checkout (`NEXT_PUBLIC_BUSINESS_WHATSAPP_ORDER`)

**Admin**

- bcrypt-protected login
- Dashboard: revenue roll-up (ex-cancelled), customer count, low-stock tally
- **OrderAlertPoller**: polls dashboard endpoint and plays a short **beep** when `latestOrderCreatedAt` changes
- Products CRUD (soft-delete via `isActive`), optional Supabase image upload
- Categories CRUD (hard delete only when empty)
- Orders board with filters + status transitions (`PENDING` → `PACKED` → `DISPATCHED` → `DELIVERED`, plus `CANCELLED`)
- CSV export (`/api/admin/orders/export`)
- Low-stock report (`/api/admin/inventory/low-stock`)

## API overview (REST)

| Area | Examples |
|------|-----------|
| Auth | `POST /api/auth/firebase`, `POST /api/auth/logout` |
| Customer | `GET/PATCH /api/customer/profile`, `GET/POST /api/customer/addresses`, `GET/POST /api/customer/cart/items`, `POST /api/customer/orders`, `POST /api/customer/orders/reorder` |
| Public | `GET /api/products`, `GET /api/products/[slug]`, `GET /api/categories` |
| Admin | `POST /api/admin/auth/login`, `GET /api/admin/dashboard`, CRUD under `/api/admin/products`, `/api/admin/categories`, `/api/admin/orders`, … |

All cookies are **HTTP-only** JWTs (`customer_session`, `admin_session`). Admin APIs additionally invoke `requireAdmin()` inside handlers even though middleware protects `/admin/*` pages only.

## Security notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY`, `FIREBASE_PRIVATE_KEY`, or `JWT_SECRET` to the browser.
- Rotate seeded admin credentials before launch.
- Consider rate limiting / WAF in front of OTP endpoints for production abuse mitigation.

## Scripts reference

| Script | Purpose |
|--------|---------|
| `npm run dev` | Turbopack dev server |
| `npm run build` | `prisma generate` + production Next build |
| `npm run start` | Serve `.next` |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run db:push` | Push schema without migration files |
| `npm run db:migrate` | Interactive migrations (local dev) |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed` | Seed demo dataset |

---

Built as a vertical starter — extend with payments, delivery partner APIs, ERP exports, or richer tier-contract pricing without breaking immutable `order_items` snapshots.
