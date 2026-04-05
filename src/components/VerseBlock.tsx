"use client";

import { useState } from "react";
import type { Annotation } from "@/lib/annotations";
import { ANN_COLORS } from "@/lib/annotations";
import { lookupWord } from "@/lib/data/lexicon";
import { LexiconPopover } from "./LexiconPopover";
import { AnnotationEditor } from "./AnnotationEditor";

export type VerseData = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  paragraphBreakBefore?: boolean;
};

type Props = {
  verse: VerseData;
  annotations: Annotation[];
  onAnnotationChange: () => void;
  hasVariant?: boolean;
  onVariantClick?: (verse: number) => void;
  highlighted?: boolean;
};

function colorFor(annotations: Annotation[]): string | null {
  if (annotations.length === 0) return null;
  const newest = [...annotations].sort((a, b) => b.updatedAt - a.updatedAt)[0];
  const c = ANN_COLORS.find((x) => x.value === newest.color);
  return c?.border ?? null;
}

export function VerseBlock({
  verse,
  annotations,
  onAnnotationChange,
  hasVariant,
  onVariantClick,
  highlighted,
}: Props) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [lexEntry, setLexEntry] = useState<{
    word: string;
    rect: DOMRect;
  } | null>(null);

  const borderColor = colorFor(annotations);
  const hasAnn = annotations.length > 0;

  return (
    <>
      {verse.paragraphBreakBefore && <div style={{ height: 16 }} />}
      <div
        id={`v${verse.verse}`}
        className={`verse-row group relative py-0.5 pl-4 pr-2 -mx-2 ${highlighted ? "verse-pulse" : ""}`}
        style={{
          borderLeft: borderColor ? `2px solid ${borderColor}` : "2px solid transparent",
          marginLeft: -4,
        }}
        onClick={(e) => {
          // Don't open the editor if the click landed on a word, a variant
          // button, an existing annotation panel, or an inner link.
          const target = e.target as HTMLElement;
          if (
            target.closest(".lex-word") ||
            target.closest("button") ||
            target.closest("a") ||
            target.closest("[data-ann-editor]")
          ) return;
          setEditorOpen((o) => !o);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setEditorOpen((o) => !o);
          }
        }}
        aria-label={`Verse ${verse.verse}${hasAnn ? " — has annotations" : ""}`}
      >
        {hasAnn && (
          <span
            className="absolute left-0 top-3 w-1.5 h-1.5 rounded-full"
            style={{ background: borderColor ?? "var(--color-gold)", marginLeft: -8 }}
            aria-label={`${annotations.length} annotations`}
          />
        )}
        <p className="verse-text">
          <sup className="verse-number">{verse.verse}</sup>
          {hasVariant && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVariantClick?.(verse.verse);
              }}
              className="verse-number"
              style={{ color: "var(--color-gold)" }}
              aria-label="Textual variant — click for details"
              title="Textual variant"
            >
              †{" "}
            </button>
          )}
          <WordSpans
            text={verse.text}
            onWordClick={(w, rect) => setLexEntry({ word: w, rect })}
          />
        </p>

        {editorOpen && (
          <div data-ann-editor onClick={(e) => e.stopPropagation()}>
            <AnnotationEditor
              book={verse.book}
              chapter={verse.chapter}
              verse={verse.verse}
              existing={annotations}
              onClose={() => setEditorOpen(false)}
              onChange={onAnnotationChange}
            />
          </div>
        )}
      </div>
      {lexEntry && (
        <LexiconPopover
          word={lexEntry.word}
          anchor={lexEntry.rect}
          onClose={() => setLexEntry(null)}
        />
      )}
    </>
  );
}

/** Wrap known-lexical words in a clickable span with an always-visible
 *  dotted underline so readers know which words can be looked up. */
function WordSpans({
  text,
  onWordClick,
}: {
  text: string;
  onWordClick: (word: string, rect: DOMRect) => void;
}) {
  const tokens = text.split(/(\s+)/);
  return (
    <>
      {tokens.map((tok, i) => {
        if (/^\s+$/.test(tok)) return tok;
        const stripped = tok.replace(/[^A-Za-z'-]/g, "");
        const lex = stripped ? lookupWord(stripped) : null;
        if (!lex) return tok;
        return (
          <span
            key={i}
            className="lex-word"
            onClick={(e) => {
              e.stopPropagation();
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              onWordClick(stripped, rect);
            }}
          >
            {tok}
          </span>
        );
      })}
    </>
  );
}
