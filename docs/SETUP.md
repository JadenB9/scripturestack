# Setup & deployment history

This doc records exactly how the Scripture Stack infrastructure was set up, so you can reproduce it, debug it, or tear it down.

## Prerequisites

- `node` 20+ and `npm`
- `gh` (GitHub CLI) authenticated as `JadenB9`
- `vercel` CLI authenticated
- `railway` CLI authenticated
- A Cloudflare account with control over the `j4den.com` zone

## One-time setup (already done — for reference)

### 1. Scaffold the Next.js app

```bash
cd ~/Projects
npx create-next-app@latest scripturestack \
  --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint
cd scripturestack
npm install drizzle-orm postgres d3 recharts mapbox-gl
npm install -D drizzle-kit @types/d3 @types/mapbox-gl dotenv tsx
```

### 2. Push to GitHub

```bash
git init && git add . && git commit -m "initial scaffold"
gh repo create JadenB9/scripturestack --private --source=. --push
```

### 3. Link and deploy to Vercel

```bash
vercel link --yes --project scripturestack
vercel deploy --prod --yes
```

This also auto-connects the GitHub repo so subsequent pushes to `main` redeploy automatically.

### 4. Add the custom domain

```bash
vercel domains add scripturestack.j4den.com
```

Vercel will print an A record to add. In the Cloudflare dashboard for `j4den.com`:

- DNS → Add record
- Type: `A`
- Name: `scripturestack`
- Content: `76.76.21.21`
- Proxy status: **DNS only** (grey cloud)

SSL is provisioned automatically within a few minutes.

### 5. Provision Postgres via Vercel Marketplace

In the Vercel dashboard for `scripturestack`:
- Storage tab → Create Database → Neon → pick region → Create
- The integration auto-injects `DATABASE_URL` and ~15 other `POSTGRES_*`/`PG*` vars

Then enable pgvector in the Neon SQL editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 6. Push the schema

```bash
vercel env pull .env.local --yes     # get DATABASE_URL locally
npm run db:push                       # creates the `verses` table on Neon
```

### 7. Scaffold and deploy the Python ML service

```bash
cd ~/Projects
mkdir scripturestack-ml && cd scripturestack-ml
# (write main.py, requirements.txt, railway.json, Procfile — see the repo)
git init && git add . && git commit -m "initial scaffold"
gh repo create JadenB9/scripturestack-ml --private --source=. --push

railway login
railway init    # create empty project named scripturestack-ml
railway up      # deploy
railway domain  # generate public URL
```

### 8. Wire the Railway URL into Vercel

```bash
cd ~/Projects/scripturestack
echo "https://scripturestack-ml-production.up.railway.app" | \
  vercel env add ML_API_URL production
vercel deploy --prod
```

### 9. Add third-party API keys

```bash
# ESV API — get from https://api.esv.org/
printf "<esv-key>" | vercel env add ESV_API_KEY production --sensitive

# Mapbox — get from https://account.mapbox.com/access-tokens/
printf "<mapbox-pk-token>" | vercel env add NEXT_PUBLIC_MAPBOX_TOKEN production

vercel deploy --prod
```

Then on the Mapbox dashboard, scope the token to these origins:
- `https://scripturestack.j4den.com`
- `http://localhost:3000`

### 10. Update the j4den.com homepage

Change the Scripture Stack card in `j4den/frontend/public/index.html` (line 835) to link to `https://scripturestack.j4den.com/`, remove the old static placeholder at `frontend/public/scripturestack/`, commit and push.

## Local development

```bash
git clone git@github.com:JadenB9/scripturestack.git
cd scripturestack
npm install
vercel link --yes --project scripturestack
vercel env pull .env.local --yes
npm run dev
```

The app runs at `http://localhost:3000`. It'll hit the production Neon database and Railway ML service by default — if you want isolation, create a Neon branch and override `DATABASE_URL` in `.env.local`.

## Redeploying

Production redeploys on every push to `main` on either repo:
- `JadenB9/scripturestack:main` → Vercel
- `JadenB9/scripturestack-ml:main` → Railway

Manual redeploy if needed:
```bash
vercel deploy --prod     # frontend
railway up                # ML service (from scripturestack-ml/)
```

## Rotating secrets

```bash
cd scripturestack
vercel env rm <NAME> production --yes
printf "<new-value>" | vercel env add <NAME> production [--sensitive]
vercel deploy --prod
```

## Seeding the database

```bash
cd scripturestack
npm run seed
```

This pulls all 66 books from the ESV API, batches them through the Railway embedding service, bulk-inserts into Postgres, and creates the HNSW index. Resumable — running twice is safe.
