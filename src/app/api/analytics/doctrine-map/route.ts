import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { verses } from "@/db/schema";
import { BOOKS } from "@/lib/data/books";
import { DOCTRINES } from "@/lib/data/doctrines";

/**
 * Doctrine × Book matrix for the 27 NT books and 12 core doctrinal topics.
 *
 * GET /api/analytics/doctrine-map
 *
 * Returns, for each NT book:
 *   - the total word count (for normalization)
 *   - a per-doctrine score (keyword hits per 1000 words)
 *   - a small sample of matched verses per doctrine (for the drill-down panel)
 */

type DoctrineCell = {
  doctrineId: string;
  rawCount: number;
  perThousand: number;
  sample: Array<{ chapter: number; verse: number; text: string; matchedKeyword: string }>;
};

type BookRow = {
  book: string;
  totalWords: number;
  cells: DoctrineCell[];
};

const NT_BOOKS = BOOKS.filter((b) => b.testament === "NT").map((b) => b.name);

export async function GET() {
  const rows = await db
    .select({
      book: verses.book,
      chapter: verses.chapter,
      verse: verses.verse,
      text: verses.text,
    })
    .from(verses)
    .where(inArray(verses.book, NT_BOOKS));

  // Pre-build a map from keyword → doctrineId for O(1) lookup
  const keywordToDoctrine = new Map<string, string>();
  for (const d of DOCTRINES) {
    for (const kw of d.keywords) {
      keywordToDoctrine.set(kw.toLowerCase(), d.id);
    }
  }

  type PerBook = {
    totalWords: number;
    byDoctrine: Map<
      string,
      {
        rawCount: number;
        sample: Array<{ chapter: number; verse: number; text: string; matchedKeyword: string }>;
      }
    >;
  };

  const stats = new Map<string, PerBook>();

  for (const row of rows) {
    const tokens = tokenize(row.text);
    let perBook = stats.get(row.book);
    if (!perBook) {
      perBook = { totalWords: 0, byDoctrine: new Map() };
      stats.set(row.book, perBook);
    }
    perBook.totalWords += tokens.length;

    // Track which doctrines matched this verse so we only sample once per verse per doctrine.
    const matchedThisVerse = new Map<string, string>();
    for (const tok of tokens) {
      const doctrineId = keywordToDoctrine.get(tok);
      if (!doctrineId) continue;
      let bucket = perBook.byDoctrine.get(doctrineId);
      if (!bucket) {
        bucket = { rawCount: 0, sample: [] };
        perBook.byDoctrine.set(doctrineId, bucket);
      }
      bucket.rawCount += 1;
      if (!matchedThisVerse.has(doctrineId)) {
        matchedThisVerse.set(doctrineId, tok);
      }
    }
    for (const [doctrineId, keyword] of matchedThisVerse.entries()) {
      const bucket = perBook.byDoctrine.get(doctrineId);
      if (bucket && bucket.sample.length < 12) {
        bucket.sample.push({
          chapter: row.chapter,
          verse: row.verse,
          text: row.text,
          matchedKeyword: keyword,
        });
      }
    }
  }

  const result: BookRow[] = NT_BOOKS.map((book) => {
    const perBook = stats.get(book);
    const totalWords = perBook?.totalWords ?? 0;
    const cells: DoctrineCell[] = DOCTRINES.map((d) => {
      const bucket = perBook?.byDoctrine.get(d.id);
      const rawCount = bucket?.rawCount ?? 0;
      const perThousand = totalWords > 0 ? (rawCount / totalWords) * 1000 : 0;
      return {
        doctrineId: d.id,
        rawCount,
        perThousand,
        sample: bucket?.sample ?? [],
      };
    });
    return { book, totalWords, cells };
  });

  return NextResponse.json({
    books: NT_BOOKS,
    doctrines: DOCTRINES.map((d) => ({ id: d.id, label: d.label })),
    rows: result,
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
    .filter((t) => t.length > 1);
}
