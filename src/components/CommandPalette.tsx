"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BOOKS, type BookMeta } from "@/lib/data/books";
import { useShell } from "./AppShell";

type PaletteItem = {
  label: string;
  sublabel?: string;
  href: string;
  keywords: string;
  kind: "book" | "feature";
};

const FEATURE_ITEMS: PaletteItem[] = [
  { label: "Home", href: "/", keywords: "home dashboard start", kind: "feature" },
  { label: "Books", href: "/books", keywords: "books library canon", kind: "feature" },
  { label: "Reading", href: "/read/Genesis/1", keywords: "read bible verses chapter", kind: "feature" },
  { label: "Walkthrough", href: "/walkthrough", keywords: "walkthrough tour chronological timeline map play", kind: "feature" },
  { label: "Annotations", href: "/annotations", keywords: "annotations notes highlights tags", kind: "feature" },
  { label: "Timeline", href: "/timeline", keywords: "timeline epochs eras history covenants", kind: "feature" },
  { label: "Atlas", href: "/atlas", keywords: "atlas map locations geography", kind: "feature" },
  { label: "Calendar", href: "/calendar", keywords: "calendar hebrew feasts festivals", kind: "feature" },
  { label: "Cross-reference Graph", href: "/graph", keywords: "graph cross references network", kind: "feature" },
  { label: "Prophecy Tracker", href: "/prophecy", keywords: "prophecy fulfillment messianic", kind: "feature" },
  { label: "Manuscripts", href: "/manuscripts", keywords: "manuscripts variants sinaiticus vaticanus dead sea scrolls", kind: "feature" },
  { label: "Translation Compare", href: "/compare", keywords: "compare translations esv kjv nasb parallel", kind: "feature" },
  { label: "Word Frequency", href: "/analytics/frequency", keywords: "frequency word count doctrine", kind: "feature" },
  { label: "Text Character", href: "/analytics/character", keywords: "sentiment character narrative texture", kind: "feature" },
  { label: "Semantic Search", href: "/analytics/semantic", keywords: "semantic search embeddings meaning map", kind: "feature" },
  { label: "Authorship", href: "/analytics/authorship", keywords: "author fingerprint paul john luke stylometry", kind: "feature" },
];

export function CommandPalette() {
  const { isCommandOpen: open, closeCommand: onClose } = useShell();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const items: PaletteItem[] = useMemo(() => {
    const bookItems: PaletteItem[] = BOOKS.map((b: BookMeta) => ({
      label: b.name,
      sublabel: `${b.testament === "OT" ? "Old Testament" : "New Testament"} · ${b.genre}`,
      href: `/read/${encodeURIComponent(b.name)}/1`,
      keywords: `${b.name} ${b.genre} ${b.testament} ${b.author}`.toLowerCase(),
      kind: "book",
    }));
    return [...FEATURE_ITEMS, ...bookItems];
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return items.slice(0, 30);
    const needle = q.trim().toLowerCase();
    const scored = items
      .map((item) => {
        const label = item.label.toLowerCase();
        let score = 0;
        if (label.startsWith(needle)) score += 10;
        if (label.includes(needle)) score += 5;
        if (item.keywords.includes(needle)) score += 2;
        return { item, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);
    return scored.map((x) => x.item);
  }, [q, items]);

  useEffect(() => {
    if (open) {
      setQ("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => { setSelected(0); }, [q]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const chosen = filtered[selected];
        if (chosen) {
          router.push(chosen.href);
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, selected, router, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4"
      style={{ background: "rgba(15, 12, 8, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] border rounded-lg overflow-hidden fade-in"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border-strong)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to book, chapter, or feature…"
            className="w-full bg-transparent outline-none text-[15px]"
            style={{ border: "none", padding: 0 }}
          />
        </div>
        <div className="max-h-[52vh] overflow-y-auto py-2">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center t-meta">No results</div>
          )}
          {filtered.map((item, i) => (
            <button
              key={item.href + item.label}
              onMouseEnter={() => setSelected(i)}
              onClick={() => { router.push(item.href); onClose(); }}
              className="w-full text-left px-4 py-2 flex items-center gap-3 border-l-2"
              style={{
                background: i === selected ? "var(--color-gold-light)" : "transparent",
                borderLeftColor: i === selected ? "var(--color-gold)" : "transparent",
              }}
            >
              <span className="t-label" style={{ fontSize: 9, minWidth: 38 }}>
                {item.kind === "book" ? "BOOK" : "GO"}
              </span>
              <span className="flex-1">
                <div className="text-[14px]" style={{ color: "var(--color-ink)" }}>{item.label}</div>
                {item.sublabel && (
                  <div className="text-[11px]" style={{ color: "var(--color-ink-faint)" }}>{item.sublabel}</div>
                )}
              </span>
            </button>
          ))}
        </div>
        <div
          className="px-4 py-2 border-t flex items-center justify-between text-[11px]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-ink-faint)" }}
        >
          <div className="flex gap-4">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
            <span>esc close</span>
          </div>
          <span>{filtered.length} results</span>
        </div>
      </div>
    </div>
  );
}
