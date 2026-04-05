import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { verses } from "@/db/schema";

/**
 * Semantic search over the verses table.
 *
 * POST /api/search
 * Body: { query: string, limit?: number }
 *
 * Flow:
 *   1. Send `query` to the Railway ML service → get an embedding vector
 *   2. Run a pgvector cosine-distance query against `verses.embedding`
 *   3. Return the top N matches
 *
 * Requires the `verses` table to be seeded (see scripts/seed-verses.ts)
 * and the HNSW index to exist:
 *   CREATE INDEX ON verses USING hnsw (embedding vector_cosine_ops);
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const query = typeof body.query === "string" ? body.query.trim() : "";
  const limit = Math.min(Math.max(Number(body.limit) || 10, 1), 50);

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const mlUrl = process.env.ML_API_URL;
  if (!mlUrl) {
    return NextResponse.json({ error: "ML_API_URL not configured" }, { status: 500 });
  }

  // 1. Embed the query via the Railway ML service
  let embedding: number[];
  try {
    const res = await fetch(`${mlUrl.replace(/\/$/, "")}/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: [query] }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`ML service returned ${res.status}`);
    const data = (await res.json()) as { embeddings: number[][] };
    embedding = data.embeddings[0];
  } catch (err) {
    return NextResponse.json(
      { error: "embedding failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }

  // 2. Vector similarity search (pgvector cosine distance = <=>)
  const vectorLiteral = `[${embedding.join(",")}]`;
  const results = await db.execute(sql`
    select
      id, book, chapter, verse, text,
      1 - (embedding <=> ${vectorLiteral}::vector) as similarity
    from ${verses}
    where embedding is not null
    order by embedding <=> ${vectorLiteral}::vector
    limit ${limit}
  `);

  return NextResponse.json({ query, results });
}
