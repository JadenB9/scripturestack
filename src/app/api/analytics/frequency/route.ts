import { NextResponse } from "next/server";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db/client";
import { verses } from "@/db/schema";
import { ENGLISH_STOPWORDS } from "@/lib/data/doctrines";

/**
 * Word-frequency analyzer for a book (optionally narrowed to a chapter range).
 *
 * GET /api/analytics/frequency?book=Psalms&from=1&to=30
 *
 * Returns the top 60 content words with raw counts plus a few aggregates and
 * a small sample of verses per word so the UI can populate its drill-down panel
 * without an extra round trip.
 */

type FrequencyWord = {
  word: string;
  count: number;
  sample: Array<{ chapter: number; verse: number; text: string }>;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const book = url.searchParams.get("book")?.trim() || "";
  const fromStr = url.searchParams.get("from");
  const toStr = url.searchParams.get("to");

  if (!book) {
    return NextResponse.json({ error: "book is required" }, { status: 400 });
  }

  const from = fromStr ? Math.max(1, parseInt(fromStr, 10)) : undefined;
  const to = toStr ? Math.max(1, parseInt(toStr, 10)) : undefined;

  const conditions = [eq(verses.book, book)];
  if (from !== undefined) conditions.push(gte(verses.chapter, from));
  if (to !== undefined) conditions.push(lte(verses.chapter, to));

  const rows = await db
    .select({
      chapter: verses.chapter,
      verse: verses.verse,
      text: verses.text,
    })
    .from(verses)
    .where(and(...conditions));

  if (rows.length === 0) {
    return NextResponse.json({
      book,
      from: from ?? null,
      to: to ?? null,
      totalWords: 0,
      totalVerses: 0,
      words: [] as FrequencyWord[],
      notIndexed: true,
    });
  }

  const counts = new Map<string, number>();
  const samples = new Map<string, Array<{ chapter: number; verse: number; text: string }>>();
  let totalWords = 0;

  for (const row of rows) {
    const tokens = tokenize(row.text);
    totalWords += tokens.length;
    for (const tok of tokens) {
      if (ENGLISH_STOPWORDS.has(tok)) continue;
      counts.set(tok, (counts.get(tok) ?? 0) + 1);
      const existing = samples.get(tok);
      if (!existing) {
        samples.set(tok, [{ chapter: row.chapter, verse: row.verse, text: row.text }]);
      } else if (existing.length < 8) {
        // Avoid pushing the same verse twice if the word appears multiple times.
        const last = existing[existing.length - 1];
        if (!(last.chapter === row.chapter && last.verse === row.verse)) {
          existing.push({ chapter: row.chapter, verse: row.verse, text: row.text });
        }
      }
    }
  }

  const words: FrequencyWord[] = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 60)
    .map(([word, count]) => ({
      word,
      count,
      sample: samples.get(word) ?? [],
    }));

  return NextResponse.json({
    book,
    from: from ?? null,
    to: to ?? null,
    totalWords,
    totalVerses: rows.length,
    words,
    notIndexed: false,
  });
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
