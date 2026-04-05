/**
 * Seed the `verses` table with the full ESV text and embeddings.
 *
 * Usage:
 *   npm run seed
 *
 * This script:
 *   1. Fetches each book of the Bible from the Crossway ESV API
 *   2. Parses each verse
 *   3. Batches verses (64 at a time) to the Railway ML /embed endpoint
 *   4. Bulk inserts into Postgres
 *
 * Rate limits:
 *   - ESV API: 5000 requests/day. One request per book keeps us well under this.
 *   - Railway ML: self-hosted, no hard limit, but batch size 64 is a good balance.
 *
 * Resumable: the script uses INSERT ... ON CONFLICT DO NOTHING, so running it
 * a second time will skip already-seeded verses.
 */
import "dotenv/config";
import { db } from "../src/db/client";
import { verses, type NewVerse } from "../src/db/schema";
import { sql } from "drizzle-orm";

const ESV_API_BASE = "https://api.esv.org/v3";
const BATCH_SIZE = 64;

const BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation",
];

type ParsedVerse = { book: string; chapter: number; verse: number; text: string };

async function fetchBook(book: string): Promise<ParsedVerse[]> {
  const key = process.env.ESV_API_KEY;
  if (!key) throw new Error("ESV_API_KEY not set");

  const params = new URLSearchParams({
    q: book,
    "include-passage-references": "false",
    "include-verse-numbers": "true",
    "include-first-verse-numbers": "true",
    "include-footnotes": "false",
    "include-headings": "false",
    "include-short-copyright": "false",
    "indent-poetry": "false",
    "indent-paragraphs": "0",
  });

  const res = await fetch(`${ESV_API_BASE}/passage/text/?${params}`, {
    headers: { Authorization: `Token ${key}` },
  });
  if (!res.ok) throw new Error(`ESV API returned ${res.status} for ${book}`);

  const data = (await res.json()) as { passages: string[] };
  const raw = (data.passages?.[0] ?? "").trim();

  // Parse verse-numbered text. ESV returns verses prefixed with [N] markers.
  const parsed: ParsedVerse[] = [];
  const chapterRegex = /\[(\d+):(\d+)\]/g;
  let chapter = 1;
  let verse = 1;
  let lastIndex = 0;

  const matches = [...raw.matchAll(chapterRegex)];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const nextStart = matches[i + 1]?.index ?? raw.length;
    if (i > 0) {
      const text = raw.slice(lastIndex, m.index).trim();
      const prev = matches[i - 1];
      if (text && prev) {
        parsed.push({
          book,
          chapter: Number(prev[1]),
          verse: Number(prev[2]),
          text,
        });
      }
    }
    chapter = Number(m[1]);
    verse = Number(m[2]);
    lastIndex = (m.index ?? 0) + m[0].length;
    if (i === matches.length - 1) {
      const text = raw.slice(lastIndex, nextStart).trim();
      if (text) parsed.push({ book, chapter, verse, text });
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
  });
  if (!res.ok) throw new Error(`ML /embed returned ${res.status}`);
  const data = (await res.json()) as { embeddings: number[][] };
  return data.embeddings;
}

async function main() {
  console.log("scripturestack seed — fetching ESV + generating embeddings");

  for (const book of BOOKS) {
    console.log(`\n[${book}]`);
    const bookVerses = await fetchBook(book);
    console.log(`  fetched ${bookVerses.length} verses`);

    for (let i = 0; i < bookVerses.length; i += BATCH_SIZE) {
      const batch = bookVerses.slice(i, i + BATCH_SIZE);
      const embeddings = await embedBatch(batch.map((v) => v.text));
      const rows: NewVerse[] = batch.map((v, idx) => ({
        book: v.book,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text,
        embedding: embeddings[idx],
      }));
      await db
        .insert(verses)
        .values(rows)
        .onConflictDoNothing();
      process.stdout.write(`  batch ${i / BATCH_SIZE + 1}: ${rows.length} rows\r`);
    }
    console.log("");
  }

  // Build the HNSW index for fast cosine search (safe to run repeatedly).
  console.log("\nbuilding HNSW index...");
  await db.execute(sql`
    create index if not exists verses_embedding_hnsw_idx
    on verses using hnsw (embedding vector_cosine_ops)
  `);

  console.log("\ndone ✓");
  process.exit(0);
}

main().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
