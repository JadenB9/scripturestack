"use client";

import { useEffect } from "react";
import { VARIANTS } from "@/lib/data/manuscripts";

type Props = {
  book: string;
  chapter: number;
  verse: number;
  onClose: () => void;
};

export function VariantModal({ book, chapter, verse, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const variant = VARIANTS.find(
    (v) => v.book === book && v.chapter === chapter && v.verseStart === verse
  );
  if (!variant) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 12, 8, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="max-w-[640px] w-full max-h-[80vh] overflow-y-auto border rounded-lg"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border-strong)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
          <div>
            <div className="t-label">Textual variant</div>
            <h2 className="font-serif text-[18px]" style={{ color: "var(--color-ink)" }}>
              {variant.passage}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="badge"
              style={{
                background: variant.significance === "significant" ? "#FEE2E2" : variant.significance === "moderate" ? "#FEF3C7" : "#E7E5E4",
                color: variant.significance === "significant" ? "#991B1B" : variant.significance === "moderate" ? "#92400E" : "#57534E",
              }}
            >
              {variant.significance}
            </span>
            <button onClick={onClose} aria-label="Close" style={{ color: "var(--color-ink-muted)" }}>×</button>
          </div>
        </header>

        <div className="px-5 py-5">
          {variant.readings.map((r, i) => (
            <div key={i} className="mb-5">
              <div className="text-[11px] uppercase tracking-wide mb-1.5" style={{ color: "var(--color-ink-faint)" }}>
                Reading {i + 1} — {r.label}
              </div>
              <p className="font-serif text-[15px] leading-[1.65] mb-2 pl-3 border-l-2" style={{ color: "var(--color-ink)", borderColor: "var(--color-gold)" }}>
                {r.text}
              </p>
              <div className="text-[11px]" style={{ color: "var(--color-ink-muted)" }}>
                Witnesses: {r.witnesses.join(", ")}
              </div>
            </div>
          ))}
          <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
            <div className="text-[11px] uppercase tracking-wide mb-1.5" style={{ color: "var(--color-ink-faint)" }}>
              Scholarly note
            </div>
            <p className="text-[13px] leading-[1.6]" style={{ color: "var(--color-ink)" }}>
              {variant.note}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
