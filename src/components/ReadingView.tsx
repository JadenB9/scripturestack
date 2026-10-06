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
  const router = useRouter();

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

  // Keyboard navigation: left/right arrows for prev/next chapter, Escape
  // closes whichever side panel is open.
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
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, router]);

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
