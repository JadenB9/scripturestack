"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { VerseBlock, type VerseData } from "./VerseBlock";
import { ChapterTimeline } from "./ChapterTimeline";
import { CommentaryPanel } from "./CommentaryPanel";
import { TranslationPanel } from "./TranslationPanel";
import { VariantModal } from "./VariantModal";
import { recordLastRead } from "./ContinueReading";
import { listForChapter, type Annotation } from "@/lib/annotations";
import type { ChapterEvent } from "@/lib/data/chapter-events";

type Props = {
  book: string;
  chapter: number;
  verses: VerseData[];
  events: ChapterEvent[];
  variantVerses: number[];
  totalChapters: number;
  prev: { book: string; chapter: number } | null;
  next: { book: string; chapter: number } | null;
};

type Panel = "none" | "commentary" | "translation";

export function ReadingView({
  book,
  chapter,
  verses,
  events,
  variantVerses,
  prev,
  next,
}: Props) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [panel, setPanel] = useState<Panel>("none");
  const [highlightVerse, setHighlightVerse] = useState<number | null>(null);
  const [variantVerse, setVariantVerse] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");

  const refreshAnnotations = useCallback(() => {
    setAnnotations(listForChapter(book, chapter));
  }, [book, chapter]);

  useEffect(() => {
    refreshAnnotations();
    recordLastRead({ book, chapter, ts: Date.now() });
    const handler = () => refreshAnnotations();
    window.addEventListener("ss-annotations-updated", handler);
    return () => window.removeEventListener("ss-annotations-updated", handler);
  }, [book, chapter, refreshAnnotations]);

  // Keyboard navigation: left/right arrows for prev/next chapter
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft" && prev) {
        window.location.href = `/read/${encodeURIComponent(prev.book)}/${prev.chapter}`;
      }
      if (e.key === "ArrowRight" && next) {
        window.location.href = `/read/${encodeURIComponent(next.book)}/${next.chapter}`;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  const handleJump = useCallback((verseNumber: number) => {
    const el = document.getElementById(`v${verseNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightVerse(verseNumber);
      setTimeout(() => setHighlightVerse(null), 1500);
    }
  }, []);

  const verseFontPx = fontSize === "sm" ? 16 : fontSize === "lg" ? 20 : 18;

  return (
    <div className="min-h-screen flex flex-col" style={{ fontSize: verseFontPx }}>
      {/* Sticky header */}
      <header
        className="sticky top-0 z-20 border-b backdrop-blur"
        style={{
          background: "var(--color-parchment-translucent)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 h-14 flex items-center gap-4">
          <Link
            href="/books"
            className="text-[12px]"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Books
          </Link>
          <span className="font-serif text-[16px]" style={{ color: "var(--color-ink)" }}>
            {book}
          </span>
          <span className="font-serif text-[16px]" style={{ color: "var(--color-gold)" }}>
            {chapter}
          </span>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setFontSize((s) => (s === "sm" ? "md" : s === "md" ? "lg" : "sm"))}
              className="btn btn-ghost"
              aria-label="Cycle font size"
              title="Font size"
            >
              A<sub className="ml-0.5 text-[10px]">↕</sub>
            </button>
            <button
              onClick={() => setPanel(panel === "translation" ? "none" : "translation")}
              className="btn btn-ghost"
            >
              Translations
            </button>
            <button
              onClick={() => setPanel(panel === "commentary" ? "none" : "commentary")}
              className="btn btn-ghost"
            >
              Commentary
            </button>

            <div className="flex items-center gap-0 ml-2 border rounded" style={{ borderColor: "var(--color-border)" }}>
              {prev ? (
                <Link
                  href={`/read/${encodeURIComponent(prev.book)}/${prev.chapter}`}
                  className="px-3 h-8 flex items-center text-[12px] border-r"
                  style={{ color: "var(--color-ink-muted)", borderColor: "var(--color-border)" }}
                >
                  ←
                </Link>
              ) : (
                <span className="px-3 h-8 flex items-center text-[12px] opacity-30">←</span>
              )}
              {next ? (
                <Link
                  href={`/read/${encodeURIComponent(next.book)}/${next.chapter}`}
                  className="px-3 h-8 flex items-center text-[12px]"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  →
                </Link>
              ) : (
                <span className="px-3 h-8 flex items-center text-[12px] opacity-30">→</span>
              )}
            </div>
          </div>
        </div>

        {events.length > 0 && (
          <div className="max-w-[1080px] mx-auto px-6 md:px-10 pb-2">
            <ChapterTimeline
              events={events}
              book={book}
              chapter={chapter}
              onJumpToVerse={handleJump}
            />
          </div>
        )}
      </header>

      <div className="flex-1 flex">
        {/* Main reading column */}
        <div className="flex-1 min-w-0">
          <article className="max-w-[680px] mx-auto px-6 md:px-10 py-10">
            {verses.length === 0 && (
              <div className="py-20 text-center">
                <p className="t-label mb-3">Not yet indexed</p>
                <p className="text-[14px]" style={{ color: "var(--color-ink-muted)" }}>
                  This chapter is still being seeded. Try another chapter, or come back shortly.
                </p>
              </div>
            )}

            {verses.map((v) => {
              const verseAnns = annotations.filter((a) => a.verse === v.verse);
              return (
                <VerseBlock
                  key={`${v.book}-${v.chapter}-${v.verse}`}
                  verse={v}
                  annotations={verseAnns}
                  onAnnotationChange={refreshAnnotations}
                  hasVariant={variantVerses.includes(v.verse)}
                  onVariantClick={(n) => setVariantVerse(n)}
                  highlighted={highlightVerse === v.verse}
                />
              );
            })}

            <div
              className="mt-16 pt-6 border-t flex items-center justify-between"
              style={{ borderColor: "var(--color-border)" }}
            >
              {prev ? (
                <Link
                  href={`/read/${encodeURIComponent(prev.book)}/${prev.chapter}`}
                  className="text-[13px]"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  ← {prev.book} {prev.chapter}
                </Link>
              ) : <span />}
              {next ? (
                <Link
                  href={`/read/${encodeURIComponent(next.book)}/${next.chapter}`}
                  className="text-[13px] text-right"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  {next.book} {next.chapter} →
                </Link>
              ) : <span />}
            </div>
          </article>
        </div>

        {panel === "commentary" && (
          <CommentaryPanel book={book} chapter={chapter} onClose={() => setPanel("none")} />
        )}
        {panel === "translation" && (
          <TranslationPanel book={book} chapter={chapter} onClose={() => setPanel("none")} />
        )}
      </div>

      {variantVerse !== null && (
        <VariantModal
          book={book}
          chapter={chapter}
          verse={variantVerse}
          onClose={() => setVariantVerse(null)}
        />
      )}
    </div>
  );
}
