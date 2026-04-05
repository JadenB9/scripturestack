/**
 * Seed the `verses` table with the full ESV text and embeddings.
 *
 * Usage:
 *   npm run seed
 *
 * This script:
 *   1. Fetches each chapter of the Bible from the Crossway ESV API (1,189 calls)
 *   2. Parses each verse
 *   3. Batches verses (64 at a time) to the Railway ML /embed endpoint
 *   4. Bulk inserts into Postgres
 *
 * Rate limits:
 *   - ESV API: 5000 requests/day. 1,189 chapter queries is well under.
 *   - Railway ML: self-hosted, no hard limit, batch size 64 balances memory/latency.
 *
 * Resumable: uses ON CONFLICT DO NOTHING on (book, chapter, verse) unique index,
 * so running it a second time skips already-seeded verses.
 */
import "dotenv/config";
import { db } from "../src/db/client";
import { verses, type NewVerse } from "../src/db/schema";
import { sql } from "drizzle-orm";

const ESV_API_BASE = "https://api.esv.org/v3";
const BATCH_SIZE = 64;

// (book, chapter_count) for the 66 books of the Protestant canon.
// Ordered canonically.
const BOOKS: Array<[string, number]> = [
  ["Genesis", 50], ["Exodus", 40], ["Leviticus", 27], ["Numbers", 36], ["Deuteronomy", 34],
  ["Joshua", 24], ["Judges", 21], ["Ruth", 4], ["1 Samuel", 31], ["2 Samuel", 24],
  ["1 Kings", 22], ["2 Kings", 25], ["1 Chronicles", 29], ["2 Chronicles", 36], ["Ezra", 10],
  ["Nehemiah", 13], ["Esther", 10], ["Job", 42], ["Psalms", 150], ["Proverbs", 31],
  ["Ecclesiastes", 12], ["Song of Solomon", 8], ["Isaiah", 66], ["Jeremiah", 52], ["Lamentations", 5],
  ["Ezekiel", 48], ["Daniel", 12], ["Hosea", 14], ["Joel", 3], ["Amos", 9],
  ["Obadiah", 1], ["Jonah", 4], ["Micah", 7], ["Nahum", 3], ["Habakkuk", 3],
  ["Zephaniah", 3], ["Haggai", 2], ["Zechariah", 14], ["Malachi", 4],
  ["Matthew", 28], ["Mark", 16], ["Luke", 24], ["John", 21], ["Acts", 28],
  ["Romans", 16], ["1 Corinthians", 16], ["2 Corinthians", 13], ["Galatians", 6], ["Ephesians", 6],
  ["Philippians", 4], ["Colossians", 4], ["1 Thessalonians", 5], ["2 Thessalonians", 3],
  ["1 Timothy", 6], ["2 Timothy", 4], ["Titus", 3], ["Philemon", 1], ["Hebrews", 13],
  ["James", 5], ["1 Peter", 5], ["2 Peter", 3], ["1 John", 5], ["2 John", 1], ["3 John", 1],
  ["Jude", 1], ["Revelation", 22],
];

type ParsedVerse = { book: string; chapter: number; verse: number; text: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch a single chapter from the ESV API and parse its verses.
 * ESV returns text with [N] verse markers. Chapter comes from the query,
 * so we don't need to parse it from the text.
 *
 * Retries on 429 (rate limit) with exponential backoff.
 */
// Single-chapter books have no chapter number internally in ESV.
// Querying `Obadiah 1` returns only verse 1; querying `Obadiah` returns all 21.
const SINGLE_CHAPTER_BOOKS = new Set([
  "Obadiah",
  "Philemon",
  "2 John",
  "3 John",
  "Jude",
]);

async function fetchChapter(book: string, chapter: number): Promise<ParsedVerse[]> {
  const key = process.env.ESV_API_KEY;
  if (!key) throw new Error("ESV_API_KEY not set");

  const query = SINGLE_CHAPTER_BOOKS.has(book) ? book : `${book} ${chapter}`;
  const params = new URLSearchParams({
    q: query,
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

  const url = `${ESV_API_BASE}/passage/text/?${params}`;
  let res: Response;
  let attempt = 0;
  while (true) {
    res = await fetch(url, { headers: { Authorization: `Token ${key}` } });
    if (res.status !== 429) break;
    attempt++;
    if (attempt > 3) {
      throw new Error(`ESV API 429 (gave up after ${attempt} retries) for ${book} ${chapter}`);
    }
    // Parse "Try again in N seconds" from the 429 body and wait that long + 5s buffer.
    // If we can't parse, default to 60s.
    let waitMs = 60000;
    try {
      const body = await res.clone().json() as { detail?: string };
      const match = body.detail?.match(/Try again in (\d+)\s*seconds?/i);
      if (match) waitMs = Number(match[1]) * 1000 + 5000;
    } catch {
      // ignore
    }
    console.log(`  [rate limit] ${book} ${chapter} — retry ${attempt}/3 in ${(waitMs / 1000).toFixed(0)}s`);
    await sleep(waitMs);
  }

  if (!res.ok) {
    throw new Error(`ESV API ${res.status} for ${book} ${chapter}: ${await res.text()}`);
  }

  // Courtesy delay — user's ESV tier allows 1000 req/hour.
  // 4-second delay = 900 req/hour (100-request safety buffer).
  await sleep(4000);

  const data = (await res.json()) as { passages: string[] };
  const raw = (data.passages?.[0] ?? "").trim();
  if (!raw) return [];

  // Match [N] verse markers. Split text between consecutive markers.
  const markerRegex = /\[(\d+)\]/g;
  const matches = [...raw.matchAll(markerRegex)];
  const parsed: ParsedVerse[] = [];

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const verseNum = Number(m[1]);
    const start = (m.index ?? 0) + m[0].length;
    const end = matches[i + 1]?.index ?? raw.length;
    const text = raw
      .slice(start, end)
      .replace(/\s+/g, " ")
      .trim();
    if (text) {
      parsed.push({ book, chapter, verse: verseNum, text });
    }
  }

  return parsed;
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const mlUrl = process.env.ML_API_URL;
  if (!mlUrl) throw new Error("ML_API_URL not set");

  const res = await fetch(`${mlUrl.replace(/\/$/, "")}/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) {
    throw new Error(`ML /embed ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { embeddings: number[][] };
  return data.embeddings;
}

async function flushBatch(batch: ParsedVerse[]): Promise<number> {
  if (batch.length === 0) return 0;
  const embeddings = await embedBatch(batch.map((v) => v.text));
  const rows: NewVerse[] = batch.map((v, idx) => ({
    book: v.book,
    chapter: v.chapter,
    verse: v.verse,
    text: v.text,
    embedding: embeddings[idx],
  }));
  const inserted = await db
    .insert(verses)
    .values(rows)
    .onConflictDoNothing({ target: [verses.book, verses.chapter, verses.verse] })
    .returning({ id: verses.id });
  return inserted.length;
}

async function main() {
  const started = Date.now();
  console.log("scripturestack seed — ESV + embeddings → Postgres");
  console.log(`  books: ${BOOKS.length}`);
  const totalChapters = BOOKS.reduce((a, [, c]) => a + c, 0);
  console.log(`  chapters: ${totalChapters}`);

  // Resume support: query the DB for the max chapter loaded per book and skip
  // books/chapters that are already fully present.
  console.log("\nchecking existing verses in DB...");
  const existing = await db.execute<{
    book: string;
    chapter: number;
    n: number;
  }>(sql`
    select book, chapter, count(*)::int as n
    from verses
    group by book, chapter
  `);
  const existingMap = new Map<string, Set<number>>();
  for (const row of existing) {
    if (!existingMap.has(row.book)) existingMap.set(row.book, new Set());
    existingMap.get(row.book)!.add(row.chapter);
  }
  console.log(`  found ${existing.length} chapters already seeded`);
  console.log("");

  let totalFetched = 0;
  let totalInserted = 0;
  let pending: ParsedVerse[] = [];

  for (const [book, chapterCount] of BOOKS) {
    const doneChapters = existingMap.get(book) ?? new Set<number>();
    if (doneChapters.size >= chapterCount) {
      console.log(`  ${book.padEnd(20)} ${chapterCount.toString().padStart(3)} ch · skipped (fully loaded)`);
      continue;
    }

    const bookStart = Date.now();
    let bookVerseCount = 0;
    let chaptersFetched = 0;

    for (let chapter = 1; chapter <= chapterCount; chapter++) {
      if (doneChapters.has(chapter)) continue;
      const verseList = await fetchChapter(book, chapter);
      bookVerseCount += verseList.length;
      chaptersFetched++;
      pending.push(...verseList);

      // Flush whenever we have a full batch.
      while (pending.length >= BATCH_SIZE) {
        const batch = pending.splice(0, BATCH_SIZE);
        const n = await flushBatch(batch);
        totalInserted += n;
      }
    }

    totalFetched += bookVerseCount;
    const elapsed = ((Date.now() - bookStart) / 1000).toFixed(1);
    console.log(
      `  ${book.padEnd(20)} ${chaptersFetched.toString().padStart(3)}/${chapterCount} ch · ${bookVerseCount.toString().padStart(5)} v · ${elapsed}s`,
    );
  }

  // Flush anything remaining.
  if (pending.length > 0) {
    const n = await flushBatch(pending);
    totalInserted += n;
  }

  // Build the HNSW index for fast cosine search (safe to run repeatedly).
  console.log("\nbuilding HNSW index on verses.embedding...");
  await db.execute(sql`
    create index if not exists verses_embedding_hnsw_idx
    on verses using hnsw (embedding vector_cosine_ops)
  `);

  const totalElapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log("");
  console.log(`done ✓`);
  console.log(`  fetched:  ${totalFetched} verses`);
  console.log(`  inserted: ${totalInserted} new rows`);
  console.log(`  elapsed:  ${totalElapsed}s`);
  process.exit(0);
}

main().catch((err) => {
  console.error("\nseed failed:", err);
  process.exit(1);
});
