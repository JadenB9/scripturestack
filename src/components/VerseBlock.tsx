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
        className={`group relative py-0.5 pl-4 pr-2 -mx-2 rounded-sm ${highlighted ? "verse-pulse" : ""}`}
        style={{
          borderLeft: borderColor ? `2px solid ${borderColor}` : "2px solid transparent",
          marginLeft: -4,
        }}
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
          />{" "}
          <button
            onClick={() => setEditorOpen((o) => !o)}
            className="parent-hover-show ml-1 text-[11px]"
            style={{ color: "var(--color-ink-faint)" }}
            aria-label="Add annotation"
          >
            +
          </button>
        </p>

        {editorOpen && (
          <AnnotationEditor
            book={verse.book}
            chapter={verse.chapter}
            verse={verse.verse}
            existing={annotations}
            onClose={() => setEditorOpen(false)}
            onChange={onAnnotationChange}
          />
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

/** Wrap known-lexical words in a subtle hover span. */
function WordSpans({
  text,
  onWordClick,
}: {
  text: string;
  onWordClick: (word: string, rect: DOMRect) => void;
}) {
  // Split on whitespace preserving original text chunks.
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
