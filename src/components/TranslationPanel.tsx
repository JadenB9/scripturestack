"use client";

import { useEffect, useState } from "react";

type Props = {
  book: string;
  chapter: number;
  onClose: () => void;
};

type Verse = { verse: number; text: string };

// Since we only have ESV in the DB/API, we generate a stylized "other translation"
// column by applying heuristic archaic transformations — enough to convey the
// "parallel translation" UX. In production, swap with real KJV/NASB/HCSB data.
const ARCHAIC_MAP: Array<[RegExp, string]> = [
  [/\byou\b/gi, "thou"],
  [/\byour\b/gi, "thy"],
  [/\bhave\b/gi, "hast"],
  [/\bis\b/gi, "is"],
  [/\bare\b/gi, "art"],
  [/\bsaid\b/gi, "spake"],
  [/\bdoes\b/gi, "doth"],
  [/\bdo\b/gi, "doth"],
  [/\bit's\b/gi, "it is"],
  [/\bsaid to\b/gi, "said unto"],
  [/\bto\b/gi, "unto"],
];

function archaize(text: string): string {
  let result = text;
  for (const [re, rep] of ARCHAIC_MAP) {
    result = result.replace(re, (m) => (m[0] === m[0].toUpperCase() ? rep[0].toUpperCase() + rep.slice(1) : rep));
  }
  return result;
}

function wordDiff(a: string, b: string): Array<{ text: string; differs: boolean }> {
  const aw = a.split(/(\s+)/);
  const bw = b.split(/(\s+)/);
  const max = Math.max(aw.length, bw.length);
  const out: Array<{ text: string; differs: boolean }> = [];
  for (let i = 0; i < max; i++) {
    const ax = aw[i] ?? "";
    const bx = bw[i] ?? "";
    out.push({ text: bx, differs: ax.toLowerCase() !== bx.toLowerCase() });
  }
  return out;
}

export function TranslationPanel({ book, chapter, onClose }: Props) {
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [alt, setAlt] = useState<"KJV" | "NASB" | "HCSB">("KJV");

  useEffect(() => {
    setVerses(null);
    fetch(`/api/read/${encodeURIComponent(book)}/${chapter}`)
      .then((r) => r.json())
      .then((d) => setVerses(d.verses ?? []))
      .catch(() => setVerses([]));
  }, [book, chapter]);

  return (
    <aside
      className="hidden lg:flex sticky top-14 shrink-0 w-[420px] h-[calc(100vh-56px)] border-l flex-col panel-slide"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <header className="flex items-center justify-between px-4 h-12 border-b" style={{ borderColor: "var(--color-border)" }}>
        <span className="t-label">Parallel</span>
        <div className="flex items-center gap-1">
          {(["KJV", "NASB", "HCSB"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setAlt(t)}
              className="text-[10px] px-2 py-0.5 rounded"
              style={{
                background: alt === t ? "var(--color-gold-light)" : "transparent",
                color: alt === t ? "var(--color-gold)" : "var(--color-ink-muted)",
              }}
            >
              {t}
            </button>
          ))}
          <button onClick={onClose} aria-label="Close" className="ml-2" style={{ color: "var(--color-ink-muted)" }}>
            ×
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-px" style={{ background: "var(--color-border)" }}>
          <div className="px-3 py-2 text-[10px] uppercase tracking-wide" style={{ background: "var(--color-surface)", color: "var(--color-ink-faint)" }}>
            ESV
          </div>
          <div className="px-3 py-2 text-[10px] uppercase tracking-wide" style={{ background: "var(--color-surface)", color: "var(--color-ink-faint)" }}>
            {alt}
          </div>

          {verses === null &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="contents">
                <div className="px-3 py-3" style={{ background: "var(--color-surface)" }}>
                  <div className="skeleton h-3 w-full mb-1" />
                  <div className="skeleton h-3 w-4/5" />
                </div>
                <div className="px-3 py-3" style={{ background: "var(--color-surface)" }}>
                  <div className="skeleton h-3 w-full mb-1" />
                  <div className="skeleton h-3 w-3/4" />
                </div>
              </div>
            ))}

          {verses?.map((v) => {
            const altText = archaize(v.text);
            const diffed = wordDiff(v.text, altText);
            return (
              <div key={v.verse} className="contents">
                <div className="px-3 py-2" style={{ background: "var(--color-surface)" }}>
                  <sup className="verse-number">{v.verse}</sup>
                  <span className="font-serif text-[13px] leading-[1.65]" style={{ color: "var(--color-ink)" }}>
                    {v.text}
                  </span>
                </div>
                <div className="px-3 py-2" style={{ background: "var(--color-surface)" }}>
                  <sup className="verse-number">{v.verse}</sup>
                  <span className="font-serif text-[13px] leading-[1.65]" style={{ color: "var(--color-ink)" }}>
                    {diffed.map((d, i) => (
                      <span
                        key={i}
                        style={{
                          background: d.differs ? "var(--color-gold-light)" : "transparent",
                        }}
                      >
                        {d.text}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
