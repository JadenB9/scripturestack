/**
 * Chapter loader — prefers the verses table (seeded), falls back to the ESV API.
 * This lets the app work today, even though seeding is still in progress.
 */

import { db } from "@/db/client";
import { verses } from "@/db/schema";
import { and, eq, asc } from "drizzle-orm";
import { fetchESVChapter, type ParsedVerse } from "./esv";

export type ChapterVerse = ParsedVerse & {
  id?: number;
  source: "db" | "esv-api";
};

export async function loadChapter(
  book: string,
  chapter: number
): Promise<ChapterVerse[]> {
  // 1. Try the database first — it's cheaper and paragraph-naive, but fine.
  try {
    const rows = await db
      .select()
      .from(verses)
      .where(and(eq(verses.book, book), eq(verses.chapter, chapter)))
      .orderBy(asc(verses.verse));

    if (rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        book: r.book,
        chapter: r.chapter,
        verse: r.verse,
        text: r.text,
        source: "db",
      }));
    }
  } catch {
    // DB unavailable — fall through to ESV API
  }

  // 2. Fall back to the ESV API directly.
  try {
    const parsed = await fetchESVChapter(book, chapter);
    return parsed.map((v) => ({ ...v, source: "esv-api" as const }));
  } catch {
    return [];
  }
}
