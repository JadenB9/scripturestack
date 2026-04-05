import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LEXICON_BY_STRONGS, LEXICON } from "@/lib/data/lexicon";
import { db } from "@/db/client";
import { verses } from "@/db/schema";
import { sql } from "drizzle-orm";

type PageProps = { params: Promise<{ strongsNumber: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { strongsNumber } = await params;
  const entry = LEXICON_BY_STRONGS.get(strongsNumber.toUpperCase());
  return {
    title: entry ? `${entry.lemma} · ${entry.transliteration} · ScriptureStack` : "Lexicon · ScriptureStack",
  };
}

async function findVerses(surface: string[], limit = 40): Promise<Array<{ book: string; chapter: number; verse: number; text: string }>> {
  if (surface.length === 0) return [];
  // Build a regex-ish OR match — we use ILIKE on each surface and union the results.
  try {
    const clauses = surface.map((w) => `text ILIKE ${"'%"}${w.replace(/'/g, "''")}${"%'"}`).join(" OR ");
    const rows = await db.execute<{
      book: string;
      chapter: number;
      verse: number;
      text: string;
    }>(sql`
      select book, chapter, verse, text
      from ${verses}
      where ${sql.raw(clauses)}
      order by id
      limit ${limit}
    `);
    return rows;
  } catch {
    return [];
  }
}

export default async function LexiconPage({ params }: PageProps) {
  const { strongsNumber } = await params;
  const entry = LEXICON_BY_STRONGS.get(strongsNumber.toUpperCase());
  if (!entry) notFound();

  const matches = await findVerses(entry.surface, 40);

  return (
    <div className="min-h-screen">
      <div className="max-w-[880px] mx-auto px-6 md:px-10 pt-14 pb-24">
        <Link href="/read/Genesis/1" className="text-[12px]" style={{ color: "var(--color-ink-muted)" }}>
          ← back to reading
        </Link>

        <header className="mt-6 mb-10 pb-8 border-b" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-baseline gap-4 mb-3">
            <span
              className={entry.language === "Hebrew" ? "font-hebrew" : "font-greek"}
              style={{ fontSize: 48, color: "var(--color-ink)" }}
            >
              {entry.lemma}
            </span>
            <span className="badge badge-muted">{entry.strongs}</span>
          </div>
          <div className="text-[14px] italic mb-4" style={{ color: "var(--color-ink-muted)" }}>
            {entry.transliteration} · {entry.language} · {entry.partOfSpeech}
          </div>
          <p className="font-serif text-[18px] leading-[1.6] mb-4" style={{ color: "var(--color-ink)" }}>
            {entry.shortDefinition}
          </p>
          <p className="text-[14px] leading-[1.7]" style={{ color: "var(--color-ink-muted)" }}>
            {entry.longDefinition}
          </p>
        </header>

        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="t-h2">Verses using this word</h2>
            <span className="t-meta">{matches.length} found</span>
          </div>
          {matches.length === 0 && (
            <p className="text-[13px]" style={{ color: "var(--color-ink-faint)" }}>
              No verses found in the current index. The database is still seeding; check back later.
            </p>
          )}
          <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
            {matches.map((m) => (
              <article key={`${m.book}-${m.chapter}-${m.verse}`} className="py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
                <Link
                  href={`/read/${encodeURIComponent(m.book)}/${m.chapter}#v${m.verse}`}
                  className="font-serif text-[13px] mb-1 block"
                  style={{ color: "var(--color-gold)" }}
                >
                  {m.book} {m.chapter}:{m.verse}
                </Link>
                <p className="verse-text" style={{ fontSize: 15 }}>{m.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 pt-8 border-t" style={{ borderColor: "var(--color-border)" }}>
          <div className="t-label mb-4">More in the lexicon</div>
          <div className="flex flex-wrap gap-2">
            {LEXICON.filter((e) => e.strongs !== entry.strongs)
              .slice(0, 16)
              .map((e) => (
                <Link
                  key={e.strongs}
                  href={`/lexicon/${e.strongs}`}
                  className="px-3 py-1.5 border text-[12px] rounded"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-ink-muted)" }}
                >
                  <span className={e.language === "Hebrew" ? "font-hebrew" : "font-greek"}>{e.lemma}</span>
                  <span className="ml-2" style={{ color: "var(--color-ink-faint)" }}>{e.transliteration}</span>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
