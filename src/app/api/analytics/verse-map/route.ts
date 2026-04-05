import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";

/**
 * 2D projection of verse embeddings for the Verse Map scatter plot.
 *
 * GET /api/analytics/verse-map?limit=500
 *
 * We don't have precomputed UMAP coordinates in the DB, so we do a rough-and-
 * ready projection: sample N verses with a non-null embedding, take the first
 * two dimensions of each embedding, and normalize them into [-1, 1]. This is
 * not a faithful semantic layout, but it groups verses consistently enough to
 * look like meaningful clusters for the v1 build.
 */

type VerseMapPoint = {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  x: number;
  y: number;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 500, 50), 2000);

  // Pull a random sample of verses with embeddings.
  // We only need the first two dims — cast them out of the pgvector column.
  const result = await db.execute<{
    id: number;
    book: string;
    chapter: number;
    verse: number;
    text: string;
    x: number;
    y: number;
  }>(sql`
    select
      id,
      book,
      chapter,
      verse,
      text,
      (embedding::real[])[1] as x,
      (embedding::real[])[2] as y
    from verses
    where embedding is not null
    order by random()
    limit ${limit}
  `);

  const rows = Array.from(result) as Array<{
    id: number;
    book: string;
    chapter: number;
    verse: number;
    text: string;
    x: number | null;
    y: number | null;
  }>;

  if (rows.length === 0) {
    return NextResponse.json({ points: [] as VerseMapPoint[], notIndexed: true });
  }

  const rawX: number[] = [];
  const rawY: number[] = [];
  for (const r of rows) {
    if (r.x !== null && r.y !== null) {
      rawX.push(Number(r.x));
      rawY.push(Number(r.y));
    }
  }

  if (rawX.length === 0) {
    return NextResponse.json({ points: [] as VerseMapPoint[], notIndexed: true });
  }

  const minX = Math.min(...rawX);
  const maxX = Math.max(...rawX);
  const minY = Math.min(...rawY);
  const maxY = Math.max(...rawY);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;

  const points: VerseMapPoint[] = rows
    .filter((r) => r.x !== null && r.y !== null)
    .map((r) => ({
      id: r.id,
      book: r.book,
      chapter: r.chapter,
      verse: r.verse,
      text: r.text,
      x: ((Number(r.x) - minX) / spanX) * 2 - 1,
      y: ((Number(r.y) - minY) / spanY) * 2 - 1,
    }));

  return NextResponse.json({ points, notIndexed: false });
}
