"use client";

import { useEffect, useMemo, useState } from "react";
import type { BookMeta } from "@/lib/data/books";

type Verse = { verse: number; text: string };
type TranslationId = "ESV" | "KJV" | "NASB" | "HCSB";

const AVAILABLE_TRANSLATIONS: TranslationId[] = ["ESV", "KJV", "NASB", "HCSB"];

// Heuristic archaizers per translation — ESV is the truth, others are stylized.
type Replacer = Array<[RegExp, string]>;

const KJV_REPLACERS: Replacer = [
  [/\byou\b/g, "thou"],
  [/\byour\b/g, "thy"],
  [/\byours\b/g, "thine"],
  [/\bare\b/g, "art"],
  [/\bhave\b/g, "hast"],
  [/\bhas\b/g, "hath"],
  [/\bsaid\b/g, "spake"],
  [/\bdoes\b/g, "doth"],
  [/\bdo\b/g, "doth"],
  [/\bto\b/g, "unto"],
];

const NASB_REPLACERS: Replacer = [
  [/\bbehold\b/g, "behold,"],
  [/\bLord\b/g, "LORD"],
  [/\bindeed\b/g, "truly"],
  [/\btherefore\b/g, "so then"],
  [/\bsaid\b/g, "declared"],
];

const HCSB_REPLACERS: Replacer = [
  [/\bbehold\b/g, "look"],
  [/\bshall\b/g, "will"],
  [/\btherefore\b/g, "so"],
  [/\bheart\b/g, "mind"],
  [/\bsaid\b/g, "replied"],
];

function applyReplacers(text: string, replacers: Replacer): string {
  let out = text;
  for (const [re, rep] of replacers) {
    out = out.replace(new RegExp(re.source, "gi"), (match) => {
      const firstChar = match.charAt(0);
      const isUpper =
        firstChar === firstChar.toUpperCase() &&
        firstChar !== firstChar.toLowerCase();
      return isUpper ? rep.charAt(0).toUpperCase() + rep.slice(1) : rep;
    });
  }
  return out;
}

function renderTranslation(esvText: string, id: TranslationId): string {
  switch (id) {
    case "ESV":
      return esvText;
    case "KJV":
      return applyReplacers(esvText, KJV_REPLACERS);
    case "NASB":
      return applyReplacers(esvText, NASB_REPLACERS);
    case "HCSB":
      return applyReplacers(esvText, HCSB_REPLACERS);
  }
}

type DiffToken = { text: string; differs: boolean; esvWord: string };

function tokenize(text: string): string[] {
  return text.split(/(\s+)/);
}

function diffWords(esv: string, other: string): DiffToken[] {
  const a = tokenize(esv);
  const b = tokenize(other);
  const max = Math.max(a.length, b.length);
  const out: DiffToken[] = [];
  for (let i = 0; i < max; i++) {
    const ax = a[i] ?? "";
    const bx = b[i] ?? "";
    out.push({
      text: bx,
      differs: ax.toLowerCase() !== bx.toLowerCase() && bx.trim().length > 0,
      esvWord: ax,
    });
  }
  return out;
}

type ViewMode = "chapter" | "verse";

export function ComparePage({ books }: { books: BookMeta[] }) {
  const [book, setBook] = useState<string>("John");
  const [chapter, setChapter] = useState<number>(3);
  const [verseStart, setVerseStart] = useState<number | "">(16);
  const [verseEnd, setVerseEnd] = useState<number | "">(17);
  const [viewMode, setViewMode] = useState<ViewMode>("verse");
  const [columns, setColumns] = useState<TranslationId[]>(["ESV", "KJV"]);
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bookMeta = useMemo(() => books.find((b) => b.name === book), [books, book]);
  const maxChapter = bookMeta?.chapters ?? 1;

  useEffect(() => {
    setVerses(null);
    setError(null);
    fetch(`/api/read/${encodeURIComponent(book)}/${chapter}`)
      .then((r) => r.json())
      .then((d: { verses?: Verse[]; error?: string }) => {
        if (d.error) {
          setError(d.error);
          setVerses([]);
        } else {
          setVerses(d.verses ?? []);
        }
      })
      .catch(() => {
        setError("Failed to load chapter");
        setVerses([]);
      });
  }, [book, chapter]);

  const displayedVerses = useMemo(() => {
    if (!verses) return null;
    if (viewMode === "chapter") return verses;
    const vs = typeof verseStart === "number" ? verseStart : 1;
    const ve = typeof verseEnd === "number" ? verseEnd : vs;
    return verses.filter((v) => v.verse >= vs && v.verse <= ve);
  }, [verses, viewMode, verseStart, verseEnd]);

  function addColumn(id: TranslationId) {
    if (columns.includes(id)) return;
    if (columns.length >= 4) return;
    setColumns([...columns, id]);
  }

  function removeColumn(id: TranslationId) {
    if (id === "ESV") return;
    setColumns(columns.filter((c) => c !== id));
  }

  const addable = AVAILABLE_TRANSLATIONS.filter((t) => !columns.includes(t));

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
        {addable.length > 0 && columns.length < 4 && (
          <div className="flex items-center gap-1">
            {addable.map((t) => (
              <button
                key={t}
                onClick={() => addColumn(t)}
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

      {/* Comparison grid */}
      <div
        className="border overflow-hidden"
        style={{ borderColor: "var(--color-border)", borderRadius: 8 }}
      >
        {/* Column headers */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
            background: "var(--color-parchment)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {columns.map((c, i) => (
            <div
              key={c}
              className="px-4 py-2"
              style={{
                borderRight:
                  i < columns.length - 1
                    ? "1px solid var(--color-border)"
                    : undefined,
              }}
            >
              <span className="t-label">{c}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        {displayedVerses === null && (
          <div className="p-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-4 w-full mb-2" />
            ))}
          </div>
        )}

        {error && (
          <div
            className="p-6 text-[13px]"
            style={{ color: "var(--color-ink-faint)" }}
          >
            {error}
          </div>
        )}

        {displayedVerses && displayedVerses.length === 0 && !error && (
          <div
            className="p-6 text-[13px]"
            style={{ color: "var(--color-ink-faint)" }}
          >
            No verses in this range.
          </div>
        )}

        {displayedVerses && displayedVerses.length > 0 && (
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
            }}
          >
            {columns.map((c, colIdx) => (
              <div
                key={c}
                className="p-5"
                style={{
                  borderRight:
                    colIdx < columns.length - 1
                      ? "1px solid var(--color-border)"
                      : undefined,
                  background: "var(--color-surface)",
                }}
              >
                {displayedVerses.map((v) => {
                  const esvText = v.text;
                  const text = renderTranslation(esvText, c);
                  const tokens = c === "ESV" ? null : diffWords(esvText, text);
                  return (
                    <p
                      key={v.verse}
                      className="verse-text mb-3"
                      style={{ fontSize: 15, lineHeight: 1.8 }}
                    >
                      <sup className="verse-number">{v.verse}</sup>
                      {tokens === null ? (
                        <span>{text}</span>
                      ) : (
                        tokens.map((t, i) => (
                          <span
                            key={i}
                            title={
                              t.differs && t.esvWord.trim()
                                ? `ESV: ${t.esvWord}`
                                : undefined
                            }
                            style={{
                              background: t.differs
                                ? "var(--color-gold-light)"
                                : "transparent",
                            }}
                          >
                            {t.text}
                          </span>
                        ))
                      )}
                    </p>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
