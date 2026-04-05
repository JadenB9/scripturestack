"use client";

import { useEffect, useState } from "react";
import type { CommentaryEntry, CommentarySource } from "@/lib/data/commentary";

type Props = {
  book: string;
  chapter: number;
  onClose: () => void;
};

const SOURCES: Array<{ value: CommentarySource; label: string }> = [
  { value: "Henry", label: "Matthew Henry" },
  { value: "Spurgeon", label: "Spurgeon" },
  { value: "Boice", label: "Boice" },
];

export function CommentaryPanel({ book, chapter, onClose }: Props) {
  const [source, setSource] = useState<CommentarySource>("Henry");
  const [entries, setEntries] = useState<CommentaryEntry[] | null>(null);

  useEffect(() => {
    setEntries(null);
    fetch(`/api/commentary?book=${encodeURIComponent(book)}&chapter=${chapter}`)
      .then((r) => r.json())
      .then((data) => setEntries(data.entries ?? []))
      .catch(() => setEntries([]));
  }, [book, chapter]);

  const filtered = entries?.filter((e) => e.source === source) ?? [];

  return (
    <aside
      className="hidden lg:flex sticky top-14 shrink-0 w-[340px] h-[calc(100vh-56px)] border-l flex-col panel-slide"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <header className="flex items-center justify-between px-4 h-12 border-b" style={{ borderColor: "var(--color-border)" }}>
        <span className="t-label">Commentary</span>
        <button onClick={onClose} aria-label="Close" style={{ color: "var(--color-ink-muted)" }}>
          ×
        </button>
      </header>

      <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b" style={{ borderColor: "var(--color-border)" }}>
        {SOURCES.map((s) => (
          <button
            key={s.value}
            onClick={() => setSource(s.value)}
            className="text-[11px] px-2 py-1 rounded transition-colors"
            style={{
              background: source === s.value ? "var(--color-gold-light)" : "transparent",
              color: source === s.value ? "var(--color-gold)" : "var(--color-ink-muted)",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {entries === null && (
          <div className="space-y-3">
            <div className="skeleton h-3 w-32" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-5/6" />
          </div>
        )}
        {entries && filtered.length === 0 && (
          <p className="text-[12px]" style={{ color: "var(--color-ink-faint)" }}>
            No commentary for {book} {chapter} from {source}. Try another source above.
          </p>
        )}
        {filtered.map((e, i) => (
          <CommentaryItem key={i} entry={e} />
        ))}
      </div>
    </aside>
  );
}

function CommentaryItem({ entry }: { entry: CommentaryEntry }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncate = entry.text.length > 400;
  const shown = expanded || !needsTruncate ? entry.text : entry.text.slice(0, 360) + "…";

  return (
    <div className="mb-5 pb-5 border-b" style={{ borderColor: "var(--color-border)" }}>
      <div className="text-[10px] uppercase tracking-wide mb-1.5" style={{ color: "var(--color-ink-faint)" }}>
        {entry.source}
        {entry.verseStart ? ` · v${entry.verseStart}${entry.verseEnd ? `–${entry.verseEnd}` : ""}` : " · full chapter"}
      </div>
      <p className="text-[13px] leading-[1.6]" style={{ color: "var(--color-ink)" }}>
        {shown}
      </p>
      {needsTruncate && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 text-[11px]"
          style={{ color: "var(--color-gold)" }}
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}
