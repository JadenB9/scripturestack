"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { LexiconEntry } from "@/lib/data/lexicon";

type Props = {
  word: string;
  anchor: DOMRect;
  onClose: () => void;
};

export function LexiconPopover({ word, anchor, onClose }: Props) {
  const [entry, setEntry] = useState<LexiconEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/lexicon/${encodeURIComponent(word)}`)
      .then((r) => (r.ok ? r.json() : { entry: null }))
      .then((data) => {
        if (!cancelled) {
          setEntry(data.entry);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [word]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const outside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("keydown", handler);
    setTimeout(() => document.addEventListener("mousedown", outside), 10);
    return () => {
      window.removeEventListener("keydown", handler);
      document.removeEventListener("mousedown", outside);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  // Position below the word, horizontally centered, constrained to viewport.
  const popWidth = 320;
  const left = Math.min(
    Math.max(anchor.left + anchor.width / 2 - popWidth / 2, 12),
    window.innerWidth - popWidth - 12
  );
  const top = anchor.bottom + window.scrollY + 8;

  return createPortal(
    <div
      ref={ref}
      className="absolute fade-in"
      style={{
        top,
        left: left + window.scrollX,
        width: popWidth,
        background: "var(--color-surface)",
        border: "1px solid var(--color-border-strong)",
        borderRadius: 6,
        boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
        zIndex: 60,
      }}
    >
      {loading && (
        <div className="p-4">
          <div className="skeleton h-5 w-24 mb-2" />
          <div className="skeleton h-3 w-full mb-1" />
          <div className="skeleton h-3 w-4/5" />
        </div>
      )}
      {!loading && !entry && (
        <div className="p-4 text-[12px]" style={{ color: "var(--color-ink-muted)" }}>
          No lexicon entry for <span className="italic">{word}</span>
        </div>
      )}
      {!loading && entry && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span
              className={entry.language === "Hebrew" ? "font-hebrew text-[22px]" : "font-greek text-[22px]"}
              style={{ color: "var(--color-ink)" }}
            >
              {entry.lemma}
            </span>
            <span className="badge badge-muted" style={{ fontSize: 9 }}>
              {entry.strongs}
            </span>
          </div>
          <div className="text-[12px] italic mb-2" style={{ color: "var(--color-ink-muted)" }}>
            {entry.transliteration} · {entry.partOfSpeech}
          </div>
          <p className="text-[13px] leading-[1.55] mb-3" style={{ color: "var(--color-ink)" }}>
            {entry.shortDefinition}
          </p>
          <a
            href={`/lexicon/${entry.strongs}`}
            className="text-[11px]"
            style={{ color: "var(--color-gold)" }}
          >
            Full entry →
          </a>
        </div>
      )}
    </div>,
    document.body
  );
}
