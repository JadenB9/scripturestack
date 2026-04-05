import Link from "next/link";
import { db } from "@/db/client";
import { verses } from "@/db/schema";
import { sql } from "drizzle-orm";
import { ContinueReading } from "@/components/ContinueReading";

export const dynamic = "force-dynamic";

// The verse of the day is deterministic based on day-of-year so the same
// verse shows all day for any visitor, then rotates at midnight UTC.
function dayOfYear(d = new Date()): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const diff = d.getTime() - start;
  return Math.floor(diff / 86400000);
}

async function getVerseOfTheDay(): Promise<{
  book: string;
  chapter: number;
  verse: number;
  text: string;
} | null> {
  try {
    // Count available verses, then pick one by (dayOfYear * prime) mod total.
    // This gives deterministic-per-day selection that still scatters across the canon.
    const [{ total }] = await db.execute<{ total: number }>(
      sql`select count(*)::int as total from ${verses}`
    );
    if (!total || total === 0) return null;
    const idx = (dayOfYear() * 10007) % total;
    const rows = await db.execute<{
      book: string;
      chapter: number;
      verse: number;
      text: string;
    }>(
      sql`select book, chapter, verse, text from ${verses} order by id offset ${idx} limit 1`
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

type Tile = { label: string; href: string; desc: string; testament?: "OT" | "NT" | "Both" };

const TILES: Tile[] = [
  { label: "Reading view", href: "/read/Genesis/1", desc: "The ESV with paragraphed typography, word study, and commentary." },
  { label: "66 Books", href: "/books", desc: "Every book of the canon with author, date, and key theme." },
  { label: "Macro timeline", href: "/timeline", desc: "From creation to Revelation across nine epochs and five covenants." },
  { label: "Biblical atlas", href: "/atlas", desc: "Locations and journeys, rendered on a parchment map." },
  { label: "Cross-reference graph", href: "/graph", desc: "The most-referenced verses of scripture, force-directed." },
  { label: "Prophecy tracker", href: "/prophecy", desc: "Every major prophecy, ordered by fulfillment status." },
  { label: "Hebrew calendar", href: "/calendar", desc: "The twelve months, feasts, fasts, and sabbath cycles." },
  { label: "Semantic search", href: "/analytics/semantic", desc: "Search by meaning, not just words — powered by embeddings." },
];

export default async function HomePage() {
  const votd = await getVerseOfTheDay();

  return (
    <div className="min-h-screen">
      <div className="max-w-[1120px] mx-auto px-6 md:px-10 pt-16 md:pt-28 pb-24">
        {/* Header */}
        <header className="mb-14 md:mb-20">
          <h1 className="t-display" style={{ color: "var(--color-ink)" }}>
            ScriptureStack
          </h1>
          <p className="mt-4 text-[15px] max-w-[560px]" style={{ color: "var(--color-ink-muted)" }}>
            The Bible, compiled for curious minds. Read, annotate, compare translations, trace
            prophecies, and search scripture by meaning.
          </p>
        </header>

        {/* Verse of the day */}
        {votd && (
          <section className="mb-14">
            <div className="t-label mb-3">Verse of the day</div>
            <blockquote
              className="border-l-2 pl-6 py-2 max-w-[680px]"
              style={{ borderColor: "var(--color-gold)" }}
            >
              <p className="verse-text">{votd.text}</p>
              <Link
                href={`/read/${encodeURIComponent(votd.book)}/${votd.chapter}#v${votd.verse}`}
                className="mt-3 inline-block text-[12px]"
                style={{ color: "var(--color-gold)" }}
              >
                {votd.book} {votd.chapter}:{votd.verse} →
              </Link>
            </blockquote>
          </section>
        )}

        {/* Continue reading (client component, reads localStorage) */}
        <ContinueReading />

        {/* Feature tiles */}
        <section>
          <div className="t-label mb-4">Explore</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px]" style={{ background: "var(--color-border)" }}>
            {TILES.map((tile) => (
              <Link
                key={tile.href}
                href={tile.href}
                className="group block p-5 transition-colors"
                style={{ background: "var(--color-parchment)" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className="font-serif text-[15px] transition-colors"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {tile.label}
                  </span>
                  <span
                    className="text-[12px] opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--color-gold)" }}
                  >
                    →
                  </span>
                </div>
                <p className="text-[12px] leading-[1.55]" style={{ color: "var(--color-ink-muted)" }}>
                  {tile.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-24 pt-6 border-t flex flex-wrap items-center justify-between gap-3 text-[11px]" style={{ borderColor: "var(--color-border)", color: "var(--color-ink-faint)" }}>
          <span>ESV text © Crossway. Embeddings via sentence-transformers.</span>
          <Link href="https://j4den.com" style={{ color: "var(--color-ink-muted)" }}>
            ← j4den.com
          </Link>
        </footer>
      </div>
    </div>
  );
}
