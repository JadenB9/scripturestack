# Scripture Stack

A Bible study site I've been building that treats Scripture as something you
can search, map, and explore — not just scroll. Ask it a question in plain
English and semantic search finds verses by meaning, not keyword. Then the
rest of the site helps you see the context around what you found.

Live at [scripturestack.j4den.com](https://scripturestack.j4den.com).

## What's inside

- **Read** — a clean reading view (ESV) with commentary, cross-references,
  and annotations you can keep
- **Search** — semantic search over the whole Bible, powered by sentence
  embeddings from the companion
  [scripturestack-ml](https://github.com/JadenB9/scripturestack-ml) service
- **Atlas** — an interactive map of biblical places, with traced journeys
  (Jacob's, Paul's) and an era dropdown to watch the map change through time
- **Timeline** — the whole biblical narrative laid out chronologically,
  down to chapter level
- **Graph** — a visual web of cross-references between verses
- **Lexicon** — click a word, get the Hebrew/Greek behind it (Strong's)
- **Manuscripts** — where our text comes from: major manuscripts and the
  variants between them
- **Prophecy** — a tracker pairing prophecies with their fulfillments
- **Compare** — translations side by side
- **Analytics** — word frequency and writing-style stats across books
- **Calendar** — the Hebrew calendar with its feasts, mapped to dates

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
