# API reference

All routes are under `https://scripturestack.j4den.com/api/`.

## `GET /api/health`

Verifies Postgres and the Railway ML service are reachable.

**Response (200 — all healthy)**
```json
{
  "status": "ok",
  "checks": {
    "database": { "ok": true },
    "ml": { "ok": true }
  }
}
```

**Response (503 — degraded)**
```json
{
  "status": "degraded",
  "checks": {
    "database": { "ok": true },
    "ml": { "ok": false, "detail": "ML service returned 502" }
  }
}
```

Use this for uptime monitoring. Pings both downstream services — don't call it faster than every 30 seconds.

## `POST /api/search`

Semantic search over the verse corpus.

**Request**
```json
{
  "query": "love your enemies",
  "limit": 10
}
```

- `query` (string, required) — natural-language question or phrase
- `limit` (number, optional, default 10, max 50) — number of verses to return

**Response (200)**
```json
{
  "query": "love your enemies",
  "results": [
    {
      "id": 23801,
      "book": "Matthew",
      "chapter": 5,
      "verse": 44,
      "text": "But I say to you, Love your enemies...",
      "similarity": 0.89
    }
  ]
}
```

`similarity` is `1 - cosine_distance`, so higher is better (1.0 = identical, 0.0 = orthogonal).

**Errors**
- `400` — `query` missing or empty
- `500` — `ML_API_URL` not configured
- `502` — embedding service unreachable or errored

**Flow**
1. Client sends `query` text
2. Route handler fetches embedding from Railway `/embed`
3. Route handler runs `pgvector` cosine search on `verses` table
4. Top-N rows returned with similarity scores

**Requires:** the `verses` table must be seeded (`npm run seed`) and the HNSW index built (the seed script does this automatically on completion).
