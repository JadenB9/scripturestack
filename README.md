# Scripture Stack

A new way to study the Word. Semantic search, visualization, and ML-powered insights across the Bible.

Live at [scripturestack.j4den.com](https://scripturestack.j4den.com).

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router) + React + Tailwind CSS |
| Database | Postgres + pgvector (via Vercel Marketplace → Neon/Supabase) |
| ORM | Drizzle |
| Visualization | D3.js + Recharts |
| Maps | Mapbox GL JS |
| Bible text | Crossway ESV API |
| ML layer | Python + HuggingFace on Railway (separate repo: `scripturestack-ml`) |
| Hosting | Vercel (frontend) + Railway (ML service) |

## Development

```bash
npm install
cp .env.example .env.local
# fill in DATABASE_URL, ML_API_URL, ESV_API_KEY, NEXT_PUBLIC_MAPBOX_TOKEN
npm run dev
```

## Database

```bash
# After DATABASE_URL is set
npm run db:generate   # generate migration from schema
npm run db:push       # push schema to DB (dev)
```

First-time setup requires enabling pgvector:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## Deployment

Production deploys automatically from `main` via Vercel. Environment variables are managed in the Vercel dashboard.
