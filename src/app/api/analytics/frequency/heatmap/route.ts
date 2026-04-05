import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { verses } from "@/db/schema";
import { BOOKS, type Testament } from "@/lib/data/books";
import { ENGLISH_STOPWORDS } from "@/lib/data/doctrines";

/**
 * Per-book frequency heatmap for a set of target words.
 *
 * GET /api/analytics/frequency/heatmap?words=word1,word2,...&testament=OT|NT|ALL
 *
 * Returns a matrix of { book, perThousand } per target word so the client can
 * render a D3 heatmap of frequency per 1,000 words.
 */

type HeatmapRow = {
  word: string;
  cells: Array<{ book: string; count: number; perThousand: number }>;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const wordsParam = url.searchParams.get("words")?.trim() || "";
  const testamentParam = (url.searchParams.get("testament") || "ALL").toUpperCase();

  const targetWords = wordsParam
    .split(",")
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 0 && !ENGLISH_STOPWORDS.has(w))
    .slice(0, 20);

  if (targetWords.length === 0) {
    return NextResponse.json({ rows: [] as HeatmapRow[], books: [] });
  }

  const targetSet = new Set(targetWords);

  let bookList = BOOKS.map((b) => b.name);
  if (testamentParam === "OT" || testamentParam === "NT") {
    const t = testamentParam as Testament;
    bookList = BOOKS.filter((b) => b.testament === t).map((b) => b.name);
  }

  const rows = await db
    .select({ book: verses.book, text: verses.text })
    .from(verses)
    .where(inArray(verses.book, bookList));

  // counts[book][word] + totals[book]
  const counts = new Map<string, Map<string, number>>();
  const totals = new Map<string, number>();

  for (const row of rows) {
    const tokens = tokenize(row.text);
    totals.set(row.book, (totals.get(row.book) ?? 0) + tokens.length);
    for (const tok of tokens) {
      if (!targetSet.has(tok)) continue;
      let bucket = counts.get(row.book);
      if (!bucket) {
        bucket = new Map();
        counts.set(row.book, bucket);
      }
      bucket.set(tok, (bucket.get(tok) ?? 0) + 1);
    }
  }

  const result: HeatmapRow[] = targetWords.map((word) => ({
    word,
    cells: bookList.map((book) => {
      const count = counts.get(book)?.get(word) ?? 0;
      const total = totals.get(book) ?? 0;
      const perThousand = total > 0 ? (count / total) * 1000 : 0;
      return { book, count, perThousand };
    }),
  }));

  return NextResponse.json({ rows: result, books: bookList });
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201C\u201D]/g, "'")
    .replace(/['"]/g, "")
    .replace(/[^a-z\s-]+/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2);
}
