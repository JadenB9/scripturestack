"use client";

import { Fragment, useEffect, useState } from "react";
import { ALT_TRANSLATIONS, diffWords, type AltTranslationId } from "@/lib/translations";

type Props = {
  book: string;
  chapter: number;
  onClose: () => void;
};

type Verse = { verse: number; text: string };

// Full-width bottom sheet on phones/tablets, docked side panel from lg up.
export const PANEL_CLASS =
  "fixed inset-x-0 bottom-0 z-40 h-[70vh] w-full border-t shadow-lg flex flex-col panel-slide " +
  "lg:sticky lg:top-14 lg:inset-x-auto lg:bottom-auto lg:z-auto lg:shadow-none lg:shrink-0 " +
  "lg:h-[calc(100vh-56px)] lg:border-t-0 lg:border-l";

async function loadVerses(book: string, chapter: number, translation: string): Promise<Verse[]> {
  const r = await fetch(`/api/read/${encodeURIComponent(book)}/${chapter}?translation=${translation}`);
  const d = (await r.json()) as { verses?: Verse[]; error?: string };
  if (!r.ok || d.error) throw new Error(d.error ?? `HTTP ${r.status}`);
  return d.verses ?? [];
}

export function TranslationPanel({ book, chapter, onClose }: Props) {
  const [esv, setEsv] = useState<Verse[] | null>(null);
  const [other, setOther] = useState<Verse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alt, setAlt] = useState<AltTranslationId>("KJV");

  useEffect(() => {
    setEsv(null);
    loadVerses(book, chapter, "ESV")
      .then(setEsv)
      .catch(() => setEsv([]));
  }, [book, chapter]);

  useEffect(() => {
    let cancelled = false;
    setOther(null);
    setError(null);
    loadVerses(book, chapter, alt)
      .then((v) => !cancelled && setOther(v))
      .catch(() => {
        if (cancelled) return;
        setOther([]);
        setError(`${alt} couldn't be loaded right now.`);
      });
    return () => {
      cancelled = true;
    };
  }, [book, chapter, alt]);

  const loading = esv === null || other === null;
  const byVerse = new Map((other ?? []).map((v) => [v.verse, v.text]));

  return (
    <aside
      className={`${PANEL_CLASS} lg:w-[420px]`}
      aria-label="Parallel translation"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <header className="flex items-center justify-between px-4 h-12 border-b shrink-0" style={{ borderColor: "var(--color-border)" }}>
        <span className="t-label">Parallel</span>
        <div className="flex items-center gap-1">
          {ALT_TRANSLATIONS.map((t) => (
            <button
              key={t.id}
              onClick={() => setAlt(t.id)}
              title={t.name}
              aria-pressed={alt === t.id}
              className="text-[10px] px-2 py-0.5 rounded"
              style={{
                background: alt === t.id ? "var(--color-gold-light)" : "transparent",
                color: alt === t.id ? "var(--color-gold)" : "var(--color-ink-muted)",
              }}
            >
              {t.id}
            </button>
          ))}
          <button onClick={onClose} aria-label="Close parallel translation" className="ml-2 px-1 text-[18px] leading-none" style={{ color: "var(--color-ink-muted)" }}>
            ×
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {error && (
          <p className="px-3 py-2 text-[12px]" role="alert" style={{ color: "var(--color-ink-faint)" }}>
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-px" style={{ background: "var(--color-border)" }}>
          <div className="px-3 py-2 text-[10px] uppercase tracking-wide" style={{ background: "var(--color-surface)", color: "var(--color-ink-faint)" }}>
            ESV
          </div>
          <div className="px-3 py-2 text-[10px] uppercase tracking-wide" style={{ background: "var(--color-surface)", color: "var(--color-ink-faint)" }}>
            {alt}
          </div>

          {loading &&
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

          {esv !== null &&
            other !== null &&
            esv.map((v) => {
              const altText = byVerse.get(v.verse);
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
                      {altText === undefined
                        ? "—"
                        : diffWords(v.text, altText).map((d, i) => (
                            <Fragment key={i}>
                              {i > 0 && " "}
                              <span style={{ background: d.differs ? "var(--color-gold-light)" : "transparent" }}>
                                {d.text}
                              </span>
                            </Fragment>
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
