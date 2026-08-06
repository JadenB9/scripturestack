# Architecture

Scripture Stack is a three-tier application: a Next.js frontend on Vercel, a Postgres database (Neon with pgvector) managed by the Vercel Marketplace, and a Python ML service on Railway. Every piece of the stack is production-only — there are no dev/staging environments.

## High-level diagram

```
                     ┌──────────────────────────────┐
                     │     j4den.com (homepage)     │
                     │   Cloudflare Pages + Worker  │
                     └──────────────┬───────────────┘
                                    │ link
                                    ▼
          ┌──────────────────────────────────────────────┐
          │        scripturestack.j4den.com              │
          │    Next.js 16 App Router (Vercel prod)       │
          │    Server Components + Route Handlers        │
          └──────┬─────────────────────────┬─────────────┘
                 │                         │
                 │ SQL (pgvector)          │ HTTPS fetch
                 ▼                         ▼
    ┌───────────────────────┐   ┌───────────────────────────────┐
    │   Neon Postgres        │   │  scripturestack-ml            │
    │  (neon-teal-fence)     │   │  FastAPI + sentence-transformers
    │  verses + embeddings   │   │  Railway (us-east4)           │
    └───────────────────────┘   └───────────────────────────────┘
```

## Repositories

| Repo | Purpose | Host |
|---|---|---|
| `JadenB9/scripturestack` | Next.js frontend + API routes + seed scripts | Vercel (auto-deploy on push to `main`) |
| `JadenB9/scripturestack-ml` | Python FastAPI ML service (embeddings) | Railway (**no Git link — deploy with `railway up`**) |
| `JadenB9/j4den` | Homepage tile that links to the subdomain | Cloudflare Pages |

## Request flow — semantic search

```
  User query  ──►  POST /api/search (Vercel Function)
                        │
                        │  fetch ${ML_API_URL}/embed  ──►  Railway FastAPI
                        │                                     │
                        │                          ◄──  768-dim vector
                        ▼
              Drizzle + pgvector cosine distance query on Neon
                        │
                        ▼
                Top-N verses (JSON response)
```

## Why this shape?

- **Vercel Functions for the app layer** — stateless, scales automatically, cold-start fast enough for request-response work.
- **Railway for the ML service** — Vercel Functions have a 250 MB code limit that doesn't fit PyTorch + sentence-transformers. Railway runs the container long-lived so the model stays hot in memory after the first request.
- **Neon for Postgres + pgvector** — managed, branchable, has pgvector baked in, and auto-wires into Vercel via the Marketplace integration (no env var copy-paste).
- **Subdomain (not subpath)** — clean separation from `j4den.com`, independent SSL, no proxy layer, matches standard Vercel DX.

## Data model

Starting schema (`src/db/schema.ts`):

```ts
verses (
  id          serial primary key,
  book        text not null,
  chapter     int not null,
  verse       int not null,
  text        text not null,
  embedding   vector(768),
  created_at  timestamp default now()
)
```

Index for fast semantic search (created by the seed script on first run):

```sql
create index on verses using hnsw (embedding vector_cosine_ops);
```

Embedding dimension is 768 to match `sentence-transformers/all-mpnet-base-v2` (the default in the ML service). If you swap models, update both `schema.ts` and re-seed.

## Runtime boundaries

| Code lives in | Runs on | Has access to |
|---|---|---|
| `src/app/**/page.tsx` (Server Components) | Vercel Node.js | `DATABASE_URL`, `ML_API_URL`, `ESV_API_KEY`, `NEXT_PUBLIC_MAPBOX_TOKEN` |
| `src/app/**/page.tsx` with `'use client'` | Browser | Only `NEXT_PUBLIC_*` env vars |
| `src/app/api/**/route.ts` | Vercel Node.js function | All server env vars |
| `scripts/**.ts` | Your laptop via `tsx` | `.env.local` (pulled from Vercel) |
| `main.py` (FastAPI) | Railway container | Railway env vars (`EMBED_MODEL`, `PORT`) |

The `NEXT_PUBLIC_` prefix is the **only** thing that exposes a value to the browser. Keep the ESV key server-side only — never give it the `NEXT_PUBLIC_` prefix.
