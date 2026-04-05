# External connections

Every external system this project talks to, how it's wired, and where to find the credential.

## Vercel (hosts the Next.js app)

- **Project:** `scripturestack` under team `jadenb9944-5468s-projects`
- **GitHub integration:** pushes to `JadenB9/scripturestack:main` auto-deploy to production
- **Custom domain:** `scripturestack.j4den.com` (SSL managed by Vercel)
- **Dashboard:** https://vercel.com/jadenb9944-5468s-projects/scripturestack

## Cloudflare DNS (routes the subdomain)

- **Zone:** `j4den.com`
- **Record:** `A scripturestack → 76.76.21.21` (Vercel's anycast IP)
- **Proxy:** DNS only (grey cloud). **Do not turn on the orange cloud** — Cloudflare's proxy breaks Vercel's SSL provisioning.

## Neon Postgres (managed via Vercel Marketplace)

- **Project name:** `neon-teal-fence`
- **Branch:** `main`
- **Extensions:** `vector` (enabled via `CREATE EXTENSION IF NOT EXISTS vector`)
- **Table:** `verses` (see `src/db/schema.ts`)
- **Env vars:** auto-injected by the Vercel integration. The relevant ones:

  | Var | Used for |
  |---|---|
  | `DATABASE_URL` | runtime queries via pgbouncer pool |
  | `DATABASE_URL_UNPOOLED` | migrations and long transactions |
  | `POSTGRES_*`, `PG*` | Prisma/generic tool compatibility (unused by this project, but present) |

- **Dashboard:** https://console.neon.tech (login via Vercel)
- **SQL editor:** available from the Neon dashboard — use for ad-hoc queries and extension installs

## Railway (runs the Python ML service)

- **Service:** `scripturestack-ml`
- **Public URL:** `https://scripturestack-ml-production.up.railway.app`
- **Region:** `us-east4`
- **Deploy on:** push to `JadenB9/scripturestack-ml:main`
- **Healthcheck:** `GET /health` (configured in `railway.json`)
- **Env vars:**

  | Var | Default | Notes |
  |---|---|---|
  | `PORT` | set by Railway | bound automatically |
  | `EMBED_MODEL` | `sentence-transformers/all-mpnet-base-v2` | change to swap embedding model |

- **Dashboard:** https://railway.app/dashboard
- **Wired into Vercel as:** `ML_API_URL` env var in the `scripturestack` Vercel project

## Crossway ESV API

- **Purpose:** licensed ESV Bible text (verse-level query)
- **Auth header format:** `Authorization: Token <key>`
- **Key location:** stored as `ESV_API_KEY` in Vercel (production, sensitive)
- **Rate limit:** 5000 requests/day — the seed script batches by book (66 requests total)
- **Dashboard:** https://api.esv.org/account/
- **Docs:** https://api.esv.org/docs/

## Mapbox (client-side biblical atlas)

- **Token type:** public (`pk.`) — safe to ship to browsers because URL restrictions scope it to this project
- **Key location:** stored as `NEXT_PUBLIC_MAPBOX_TOKEN` in Vercel (production)
- **URL restrictions:** set on the Mapbox account page to:
  - `https://scripturestack.j4den.com`
  - `http://localhost:3000`
- **Dashboard:** https://account.mapbox.com/access-tokens/

## j4den.com (homepage)

- **Not a runtime dependency** — the homepage just has a static tile that links to `https://scripturestack.j4den.com/`.
- Located at `frontend/public/index.html` in the `JadenB9/j4den` repo (line 835).

## Summary of all production env vars in the `scripturestack` Vercel project

Auto-injected by Vercel + Neon integration:
```
DATABASE_URL
DATABASE_URL_UNPOOLED
POSTGRES_URL
POSTGRES_URL_NON_POOLING
POSTGRES_URL_NO_SSL
POSTGRES_PRISMA_URL
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_HOST
POSTGRES_DATABASE
PGUSER
PGPASSWORD
PGHOST
PGHOST_UNPOOLED
PGDATABASE
NEON_PROJECT_ID
```

Manually added:
```
ML_API_URL                  # Railway URL
ESV_API_KEY                 # sensitive
NEXT_PUBLIC_MAPBOX_TOKEN    # public, URL-restricted
```
