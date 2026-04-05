import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { verses } from "@/db/schema";

/**
 * Semantic search over the verses table with MMR-style diversity re-ranking.
 *
 * POST /api/search
 * Body: { query: string, limit?: number, diversify?: boolean }
 *
 * Flow:
 *   1. Embed the query via the Railway ML service.
 *   2. Pull a wide candidate pool from pgvector (top 80 by cosine similarity).
 *   3. Re-rank with MMR so we don't return 20 near-duplicate wordings of the
 *      same phrase — favoring both relevance and diversity.
 *   4. Return the top N results, each with a simple term-overlap snippet
 *      so the client can bold matching query terms.
 */

type VerseRow = {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  similarity: number;
  embedding: string | null;
};

function parseVector(raw: string | null): number[] | null {
  if (!raw) return null;
  // pgvector returns vectors as `[0.1,0.2,…]` text when cast to text.
  const inner = raw.replace(/^\[|\]$/g, "");
  if (!inner) return null;
  const parts = inner.split(",");
  const result = new Array<number>(parts.length);
  for (let i = 0; i < parts.length; i++) {
    result[i] = Number(parts[i]);
  }
  return result;
}

function dot(a: number[], b: number[]): number {
  let sum = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) sum += a[i] * b[i];
  return sum;
}

function magnitude(a: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * a[i];
  return Math.sqrt(sum);
}

function cosine(a: number[], b: number[]): number {
  const ma = magnitude(a);
  const mb = magnitude(b);
  return ma === 0 || mb === 0 ? 0 : dot(a, b) / (ma * mb);
}

/**
 * Maximal Marginal Relevance re-ranking.
 * lambda = weight on relevance vs diversity (1 = pure relevance).
 */
function mmrRerank(
  candidates: Array<VerseRow & { vector: number[] }>,
  topK: number,
  lambda = 0.72
): VerseRow[] {
  const selected: Array<VerseRow & { vector: number[] }> = [];
  const remaining = [...candidates];
  while (selected.length < topK && remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = -Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const cand = remaining[i];
      let maxSim = 0;
      for (const s of selected) {
        const sim = cosine(cand.vector, s.vector);
        if (sim > maxSim) maxSim = sim;
      }
      const mmrScore = lambda * cand.similarity - (1 - lambda) * maxSim;
      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIdx = i;
      }
    }
    selected.push(remaining[bestIdx]);
    remaining.splice(bestIdx, 1);
  }
  return selected.map(({ vector: _v, ...rest }) => rest);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const query = typeof body.query === "string" ? body.query.trim() : "";
  const limit = Math.min(Math.max(Number(body.limit) || 20, 1), 50);
  const diversify = body.diversify !== false; // default on

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const mlUrl = process.env.ML_API_URL;
  if (!mlUrl) {
    return NextResponse.json({ error: "ML_API_URL not configured" }, { status: 500 });
  }

  // 1. Embed the query.
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

  // 2. Wide candidate pool — we'll trim with MMR below. Cast the vector to
  //    text so we can parse it back out for client-side diversity scoring.
  const poolSize = diversify ? Math.min(80, limit * 4) : limit;
  const vectorLiteral = `[${embedding.join(",")}]`;
  const raw = await db.execute<VerseRow>(sql`
    select
      id, book, chapter, verse, text,
      1 - (embedding <=> ${vectorLiteral}::vector) as similarity,
      embedding::text as embedding
    from ${verses}
    where embedding is not null
    order by embedding <=> ${vectorLiteral}::vector
    limit ${poolSize}
  `);

  const candidates = Array.from(raw).map((row) => ({
    ...row,
    vector: parseVector(row.embedding) ?? [],
  }));

  // 3. MMR re-rank (or skip for raw mode).
  const reranked = diversify
    ? mmrRerank(candidates, limit)
    : candidates.slice(0, limit).map(({ vector: _v, ...rest }) => rest);

  // 4. Emit query terms so the client can highlight matches.
  const queryTerms: string[] = query
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .filter((t: string) => t.length > 2);

  return NextResponse.json({
    query,
    queryTerms,
    results: reranked.map(({ embedding: _e, ...rest }) => rest),
  });
}
