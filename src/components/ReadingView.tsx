"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

// Verse type size. Saved per device so it sticks between chapters.
type FontSize = "sm" | "md" | "lg";
const FONT_SIZE_KEY = "ss-font-size";
const FONT_PX: Record<FontSize, number> = { sm: 16, md: 18, lg: 21 };
const FONT_ORDER: FontSize[] = ["sm", "md", "lg"];

function readFontSize(): FontSize {
  try {
    const v = localStorage.getItem(FONT_SIZE_KEY);
    return v === "sm" || v === "lg" ? v : "md";
  } catch {
    return "md";
  }
}

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
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const router = useRouter();

  useEffect(() => {
    setFontSize(readFontSize());
  }, []);

  const stepFontSize = useCallback((dir: 1 | -1) => {
    setFontSize((s) => {
      const i = Math.min(FONT_ORDER.length - 1, Math.max(0, FONT_ORDER.indexOf(s) + dir));
      const next = FONT_ORDER[i];
      try {
        localStorage.setItem(FONT_SIZE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

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

  // Keyboard: left/right arrows for prev/next chapter, + and - for type
  // size, Escape closes whichever side panel is open.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") setPanel("none");
      if (e.key === "ArrowLeft" && prev) {
        router.push(`/read/${encodeURIComponent(prev.book)}/${prev.chapter}`);
      }
      if (e.key === "ArrowRight" && next) {
        router.push(`/read/${encodeURIComponent(next.book)}/${next.chapter}`);
      }
      if (e.key === "+" || e.key === "=") stepFontSize(1);
      if (e.key === "-" || e.key === "_") stepFontSize(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, router, stepFontSize]);

  // Coming in from a link like /read/John/3#v16: flash that verse so it's
  // easy to spot under the sticky header.
  useEffect(() => {
    const m = window.location.hash.match(/^#v(\d+)$/);
    if (!m) return;
    const n = Number(m[1]);
    document.getElementById(`v${n}`)?.scrollIntoView({ block: "center" });
    setHighlightVerse(n);
    const t = setTimeout(() => setHighlightVerse(null), 1500);
    return () => clearTimeout(t);
  }, [book, chapter]);

  const handleJump = useCallback((verseNumber: number) => {
    const el = document.getElementById(`v${verseNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightVerse(verseNumber);
      setTimeout(() => setHighlightVerse(null), 1500);
    }
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ "--verse-size": `${FONT_PX[fontSize]}px` } as React.CSSProperties}
    >
      {/* Sticky header */}
      <header
        className="no-print sticky top-0 z-20 border-b backdrop-blur"
        style={{
          background: "var(--color-parchment-translucent)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-[1080px] mx-auto px-4 md:px-10 min-h-14 py-2 flex flex-wrap items-center gap-x-4 gap-y-1">
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
            <div
              className="flex items-center border rounded"
              style={{ borderColor: "var(--color-border)" }}
              role="group"
              aria-label="Type size"
            >
              <button
                onClick={() => stepFontSize(-1)}
                disabled={fontSize === "sm"}
                className="px-2 h-8 text-[12px] disabled:opacity-30"
                aria-label="Smaller text"
                title="Smaller text (-)"
                style={{ color: "var(--color-ink-muted)" }}
              >
                A
              </button>
              <button
                onClick={() => stepFontSize(1)}
                disabled={fontSize === "lg"}
                className="px-2 h-8 text-[16px] border-l disabled:opacity-30"
                aria-label="Larger text"
                title="Larger text (+)"
                style={{ color: "var(--color-ink-muted)", borderColor: "var(--color-border)" }}
              >
                A
              </button>
            </div>
            <button
              onClick={() => window.print()}
              className="btn btn-ghost hidden sm:inline-flex"
              aria-label="Print this chapter"
              title="Print"
            >
              Print
            </button>
            <button
              onClick={() => setPanel(panel === "translation" ? "none" : "translation")}
              aria-pressed={panel === "translation"}
              className="btn btn-ghost"
            >
              Translations
            </button>
            <button
              onClick={() => setPanel(panel === "commentary" ? "none" : "commentary")}
              aria-pressed={panel === "commentary"}
              className="btn btn-ghost"
            >
              Commentary
            </button>

            <div className="flex items-center gap-0 ml-2 border rounded" style={{ borderColor: "var(--color-border)" }}>
              {prev ? (
                <Link
                  href={`/read/${encodeURIComponent(prev.book)}/${prev.chapter}`}
                  aria-label={`Previous chapter: ${prev.book} ${prev.chapter}`}
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
                  aria-label={`Next chapter: ${next.book} ${next.chapter}`}
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
          <article className="max-w-[680px] mx-auto px-5 md:px-10 py-10">
            {/* Paper gets a heading in place of the sticky header */}
            <h1 className="print-only font-serif text-[22px] mb-6">
              {book} {chapter}
              <span className="text-[12px] ml-3" style={{ color: "#555" }}>ESV · ScriptureStack</span>
            </h1>

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
              className="no-print mt-16 pt-6 border-t flex items-center justify-between"
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
