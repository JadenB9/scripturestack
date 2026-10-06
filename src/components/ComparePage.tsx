"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { BookMeta } from "@/lib/data/books";
import { ALT_TRANSLATIONS, TRANSLATION_IDS, diffWords, type TranslationId } from "@/lib/translations";

type Verse = { verse: number; text: string };
type Loaded = Verse[] | { error: string };

const MAX_COLUMNS = 4;

type ViewMode = "chapter" | "verse";

export function ComparePage({ books }: { books: BookMeta[] }) {
  const [book, setBook] = useState<string>("John");
  const [chapter, setChapter] = useState<number>(3);
  const [verseStart, setVerseStart] = useState<number | "">(16);
  const [verseEnd, setVerseEnd] = useState<number | "">(17);
  const [viewMode, setViewMode] = useState<ViewMode>("verse");
  const [columns, setColumns] = useState<TranslationId[]>(["ESV", "KJV"]);
  // Fetched chapters keyed by "translation|book|chapter", so flipping columns
  // on and off doesn't refetch.
  const [loaded, setLoaded] = useState<Record<string, Loaded>>({});
  const inFlight = useRef(new Set<string>());

  const bookMeta = useMemo(() => books.find((b) => b.name === book), [books, book]);
  const maxChapter = bookMeta?.chapters ?? 1;

  useEffect(() => {
    for (const t of columns) {
      const key = `${t}|${book}|${chapter}`;
      if (loaded[key] || inFlight.current.has(key)) continue;
      inFlight.current.add(key);
      fetch(`/api/read/${encodeURIComponent(book)}/${chapter}?translation=${t}`)
        .then((r) => r.json())
        .then((d: { verses?: Verse[]; error?: string }) => {
          setLoaded((prev) => ({ ...prev, [key]: d.error ? { error: d.error } : d.verses ?? [] }));
        })
        .catch(() => {
          setLoaded((prev) => ({ ...prev, [key]: { error: `Couldn't load ${t}` } }));
        })
        .finally(() => inFlight.current.delete(key));
    }
  }, [book, chapter, columns, loaded]);

  function versesFor(t: TranslationId): Loaded | undefined {
    return loaded[`${t}|${book}|${chapter}`];
  }

  const esv = versesFor("ESV");
  const esvVerses = Array.isArray(esv) ? esv : null;

  const displayedVerses = useMemo(() => {
    if (!esvVerses) return null;
    if (viewMode === "chapter") return esvVerses;
    const vs = typeof verseStart === "number" ? verseStart : 1;
    const ve = typeof verseEnd === "number" ? verseEnd : vs;
    return esvVerses.filter((v) => v.verse >= vs && v.verse <= ve);
  }, [esvVerses, viewMode, verseStart, verseEnd]);

  const columnErrors = columns
    .map((c) => versesFor(c))
    .filter((v): v is { error: string } => !!v && !Array.isArray(v))
    .map((v) => v.error);

  function addColumn(id: TranslationId) {
    if (columns.includes(id)) return;
    if (columns.length >= MAX_COLUMNS) return;
    setColumns([...columns, id]);
  }

  function removeColumn(id: TranslationId) {
    if (id === "ESV") return;
    setColumns(columns.filter((c) => c !== id));
  }

  const addable = TRANSLATION_IDS.filter((t) => !columns.includes(t));

  return (
    <div>
      {/* Passage selector */}
      <div
        className="flex flex-wrap items-end gap-4 mb-5 pb-5 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex flex-col" style={{ minWidth: 200 }}>
          <label
            className="t-label mb-1"
            htmlFor="compare-book"
            style={{ fontSize: 9 }}
          >
            Book
          </label>
          <select
            id="compare-book"
            value={book}
            onChange={(e) => {
              setBook(e.target.value);
              setChapter(1);
            }}
            className="text-[13px]"
          >
            {books.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col" style={{ width: 80 }}>
          <label
            className="t-label mb-1"
            htmlFor="compare-chapter"
            style={{ fontSize: 9 }}
          >
            Chapter
          </label>
          <input
            id="compare-chapter"
            type="number"
            min={1}
            max={maxChapter}
            value={chapter}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isNaN(n)) {
                setChapter(Math.min(Math.max(1, n), maxChapter));
              }
            }}
          />
        </div>

        <div className="flex flex-col" style={{ width: 80 }}>
          <label
            className="t-label mb-1"
            htmlFor="compare-verse-start"
            style={{ fontSize: 9 }}
          >
            Verse
          </label>
          <input
            id="compare-verse-start"
            type="number"
            min={1}
            value={verseStart}
            onChange={(e) =>
              setVerseStart(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>

        <div className="flex flex-col" style={{ width: 80 }}>
          <label
            className="t-label mb-1"
            htmlFor="compare-verse-end"
            style={{ fontSize: 9 }}
          >
            End
          </label>
          <input
            id="compare-verse-end"
            type="number"
            min={1}
            value={verseEnd}
            onChange={(e) =>
              setVerseEnd(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>

        <div className="flex flex-col">
          <span className="t-label mb-1" style={{ fontSize: 9 }}>
            View
          </span>
          <div
            className="flex border overflow-hidden"
            style={{
              borderColor: "var(--color-border-strong)",
              borderRadius: 4,
            }}
          >
            {(["verse", "chapter"] as const).map((m, i) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className="h-8 px-3 text-[11px] capitalize"
                style={{
                  background:
                    viewMode === m ? "var(--color-gold-light)" : "transparent",
                  color:
                    viewMode === m
                      ? "var(--color-gold)"
                      : "var(--color-ink-muted)",
                  borderRight:
                    i === 0 ? "1px solid var(--color-border)" : undefined,
                }}
              >
                {m === "verse" ? "Single verse" : "Entire chapter"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Columns header + add */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="t-label">Translations</span>
        <div className="flex flex-wrap gap-1">
          {columns.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 h-7 px-2 border text-[11px]"
              style={{
                borderColor: "var(--color-gold)",
                color: "var(--color-gold)",
                background: "var(--color-gold-light)",
                borderRadius: 4,
              }}
            >
              {c}
              {c !== "ESV" && (
                <button
                  onClick={() => removeColumn(c)}
                  aria-label={`Remove ${c}`}
                  className="ml-1"
                  style={{ color: "var(--color-gold)" }}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
        {addable.length > 0 && columns.length < MAX_COLUMNS && (
          <div className="flex items-center gap-1">
            {addable.map((t) => (
              <button
                key={t}
                onClick={() => addColumn(t)}
                title={ALT_TRANSLATIONS.find((a) => a.id === t)?.name}
                className="h-7 px-2 text-[11px] border"
                style={{
                  borderColor: "var(--color-border-strong)",
                  color: "var(--color-ink-muted)",
                  borderRadius: 4,
                }}
              >
                + {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comparison grid: one row per verse so the translations line up.
          Columns keep a readable minimum width and scroll sideways on phones. */}
      <div
        className="border overflow-x-auto"
        style={{ borderColor: "var(--color-border)", borderRadius: 8 }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(150px, 1fr))`,
            background: "var(--color-surface)",
          }}
        >
          {columns.map((c, i) => (
            <div
              key={c}
              className="px-4 py-2"
              style={{
                background: "var(--color-parchment)",
                borderBottom: "1px solid var(--color-border)",
                borderRight: i < columns.length - 1 ? "1px solid var(--color-border)" : undefined,
              }}
            >
              <span className="t-label">{c}</span>
            </div>
          ))}

          {displayedVerses?.map((v) =>
            columns.map((c, colIdx) => {
              const data = versesFor(c);
              const own = Array.isArray(data) ? data.find((x) => x.verse === v.verse) : undefined;
              const tokens = c === "ESV" || !own ? null : diffWords(v.text, own.text);
              return (
                <div
                  key={`${v.verse}-${c}`}
                  className="px-5 py-2"
                  style={{
                    borderRight: colIdx < columns.length - 1 ? "1px solid var(--color-border)" : undefined,
                  }}
                >
                  <p className="verse-text" style={{ fontSize: 15, lineHeight: 1.8 }}>
                    <sup className="verse-number">{v.verse}</sup>
                    {c === "ESV" && <span>{v.text}</span>}
                    {c !== "ESV" && data === undefined && (
                      <span className="skeleton inline-block h-3 w-3/4 align-middle" />
                    )}
                    {c !== "ESV" && data !== undefined && !own && (
                      <span style={{ color: "var(--color-ink-faint)" }}>—</span>
                    )}
                    {tokens?.map((t, i) => (
                      <Fragment key={i}>
                        {i > 0 && " "}
                        <span style={{ background: t.differs ? "var(--color-gold-light)" : "transparent" }}>
                          {t.text}
                        </span>
                      </Fragment>
                    ))}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {displayedVerses === null && !esv && (
          <div className="p-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-4 w-full mb-2" />
            ))}
          </div>
        )}

        {columnErrors.length > 0 && (
          <div className="p-6 text-[13px]" role="alert" style={{ color: "var(--color-ink-faint)" }}>
            {columnErrors.join(" · ")}
          </div>
        )}

        {displayedVerses && displayedVerses.length === 0 && (
          <div className="p-6 text-[13px]" style={{ color: "var(--color-ink-faint)" }}>
            No verses in this range.
          </div>
        )}
      </div>
    </div>
  );
}
