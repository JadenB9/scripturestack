/**
 * ESV API helper — used by API routes when verses aren't yet in the database
 * (seeding is still in progress) or when a translation other than ESV is needed.
 *
 * The ESV API only returns ESV text. Other translations are stubbed with
 * historical public-domain text via src/lib/data/translations.ts — a real
 * build would hit multiple translation APIs.
 */

export type ParsedVerse = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  paragraphBreakBefore?: boolean;
};

const ESV_API = "https://api.esv.org/v3";

export async function fetchESVChapter(
  book: string,
  chapter: number
): Promise<ParsedVerse[]> {
  const key = process.env.ESV_API_KEY;
  if (!key) throw new Error("ESV_API_KEY not set");

  const params = new URLSearchParams({
    q: `${book} ${chapter}`,
    "include-passage-references": "false",
    "include-verse-numbers": "true",
    "include-first-verse-numbers": "true",
    "include-footnotes": "false",
    "include-headings": "false",
    "include-short-copyright": "false",
    "include-selahs": "false",
    "indent-poetry": "false",
    "indent-paragraphs": "0",
    "indent-poetry-lines": "0",
    "indent-declares": "0",
    "indent-psalm-doxology": "0",
    "line-length": "0",
  });

  const res = await fetch(`${ESV_API}/passage/text/?${params}`, {
    headers: { Authorization: `Token ${key}` },
    // Cache at the edge — scripture doesn't change.
    next: { revalidate: 60 * 60 * 24 * 7 }, // 1 week
  });

  if (!res.ok) {
    throw new Error(`ESV API ${res.status} for ${book} ${chapter}`);
  }

  const data = (await res.json()) as { passages: string[] };
  const raw = (data.passages?.[0] ?? "").trim();
  if (!raw) return [];

  // Split on double newlines = paragraph breaks. Mark the first verse after
  // each break as paragraphBreakBefore.
  const paragraphs = raw.split(/\n\s*\n/);
  const result: ParsedVerse[] = [];

  for (let p = 0; p < paragraphs.length; p++) {
    const para = paragraphs[p];
    const markerRegex = /\[(\d+)\]/g;
    const matches = [...para.matchAll(markerRegex)];
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      const verseNum = Number(m[1]);
      const start = (m.index ?? 0) + m[0].length;
      const end = matches[i + 1]?.index ?? para.length;
      const text = para.slice(start, end).replace(/\s+/g, " ").trim();
      if (text) {
        result.push({
          book,
          chapter,
          verse: verseNum,
          text,
          paragraphBreakBefore: i === 0 && p > 0,
        });
      }
    }
  }
  return result;
}
