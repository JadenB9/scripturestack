"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ANN_COLORS,
  ANN_TYPES,
  type Annotation,
  type AnnotationType,
  downloadFile,
  exportAsJSON,
  exportAsMarkdown,
  exportAsText,
  getAllTags,
  listAnnotations,
} from "@/lib/annotations";
import { BOOKS } from "@/lib/data/books";

type SortMode = "newest" | "oldest" | "canonical";

function relativeDate(ts: number): string {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / (24 * 3600 * 1000));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

const BOOK_ORDER: Record<string, number> = Object.fromEntries(BOOKS.map((b, i) => [b.name, i]));

export function AnnotationLibrary() {
  const [items, setItems] = useState<Annotation[]>([]);
  const [types, setTypes] = useState<Set<AnnotationType>>(new Set());
  const [tagFilter, setTagFilter] = useState<string>("");
  const [bookFilter, setBookFilter] = useState<string>("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("newest");
  const [showExport, setShowExport] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setItems(listAnnotations());
    const handler = () => setItems(listAnnotations());
    window.addEventListener("ss-annotations-updated", handler);
    return () => window.removeEventListener("ss-annotations-updated", handler);
  }, []);

  const allTags = useMemo(() => getAllTags(), [items]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (types.size > 0) list = list.filter((a) => types.has(a.type));
    if (tagFilter) list = list.filter((a) => a.tags.includes(tagFilter));
    if (bookFilter) list = list.filter((a) => a.book === bookFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.text.toLowerCase().includes(q) ||
          a.book.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (sort === "newest") list.sort((a, b) => b.updatedAt - a.updatedAt);
    if (sort === "oldest") list.sort((a, b) => a.updatedAt - b.updatedAt);
    if (sort === "canonical") {
      list.sort((a, b) => {
        const bd = (BOOK_ORDER[a.book] ?? 99) - (BOOK_ORDER[b.book] ?? 99);
        if (bd !== 0) return bd;
        if (a.chapter !== b.chapter) return a.chapter - b.chapter;
        return a.verse - b.verse;
      });
    }
    return list;
  }, [items, types, tagFilter, bookFilter, query, sort]);

  const stats = useMemo(() => {
    const total = items.length;
    const byBook = new Map<string, number>();
    const byTag = new Map<string, number>();
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    let thisWeek = 0;
    for (const a of items) {
      byBook.set(a.book, (byBook.get(a.book) ?? 0) + 1);
      for (const t of a.tags) byTag.set(t, (byTag.get(t) ?? 0) + 1);
      if (a.createdAt >= weekAgo) thisWeek++;
    }
    const mostBook = [...byBook.entries()].sort((a, b) => b[1] - a[1])[0];
    const mostTag = [...byTag.entries()].sort((a, b) => b[1] - a[1])[0];
    return {
      total,
      thisWeek,
      mostBook: mostBook ? `${mostBook[0]} (${mostBook[1]})` : "—",
      mostTag: mostTag ? `${mostTag[0]} (${mostTag[1]})` : "—",
    };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="py-24 text-center border" style={{ borderColor: "var(--color-border)" }}>
        <p className="t-label mb-3">No annotations yet</p>
        <p className="text-[14px] mb-4" style={{ color: "var(--color-ink-muted)" }}>
          Start reading a chapter. Click any verse to add your first note.
        </p>
        <Link href="/read/Genesis/1" className="btn btn-primary">
          Open Genesis 1
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] mb-6" style={{ background: "var(--color-border)" }}>
        <Stat label="Total" value={stats.total.toString()} />
        <Stat label="This week" value={stats.thisWeek.toString()} />
        <Stat label="Most annotated book" value={stats.mostBook} />
        <Stat label="Most used tag" value={stats.mostTag} />
      </div>

      {/* Search */}
      <div className="mb-4 max-w-[480px]">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search annotation text, books, or tags…"
        />
      </div>

      {/* Filters + export */}
      <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex flex-wrap gap-1">
          {ANN_TYPES.map((t) => {
            const active = types.has(t.value);
            return (
              <button
                key={t.value}
                onClick={() => {
                  const next = new Set(types);
                  if (active) next.delete(t.value); else next.add(t.value);
                  setTypes(next);
                }}
                className="text-[11px] px-2 py-1 border rounded"
                style={{
                  borderColor: active ? "var(--color-gold)" : "var(--color-border)",
                  color: active ? "var(--color-gold)" : "var(--color-ink-muted)",
                  background: active ? "var(--color-gold-light)" : "transparent",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="text-[12px]" style={{ maxWidth: 140 }}>
          <option value="">All tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>#{t}</option>
          ))}
        </select>

        <select value={bookFilter} onChange={(e) => setBookFilter(e.target.value)} className="text-[12px]" style={{ maxWidth: 160 }}>
          <option value="">All books</option>
          {BOOKS.map((b) => (
            <option key={b.name} value={b.name}>{b.name}</option>
          ))}
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="text-[12px]" style={{ maxWidth: 140 }}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="canonical">Canonical order</option>
        </select>

        <div className="ml-auto relative">
          <button onClick={() => setShowExport((s) => !s)} className="btn">
            Export ↓
          </button>
          {showExport && (
            <div
              className="absolute right-0 top-10 z-10 border rounded"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border-strong)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              }}
            >
              {[
                { label: "Plain text", fn: () => downloadFile(exportAsText(), "annotations.txt", "text/plain") },
                { label: "Markdown", fn: () => downloadFile(exportAsMarkdown(), "annotations.md", "text/markdown") },
                { label: "JSON", fn: () => downloadFile(exportAsJSON(), "annotations.json", "application/json") },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => { opt.fn(); setShowExport(false); }}
                  className="block w-full text-left px-4 py-2 text-[12px] hover:bg-[var(--color-gold-light)]"
                  style={{ color: "var(--color-ink)" }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Count */}
      <div className="t-meta mb-3">{filtered.length} annotation{filtered.length !== 1 ? "s" : ""}</div>

      {/* List */}
      <div>
        {filtered.map((a) => {
          const hue = ANN_COLORS.find((c) => c.value === a.color)!;
          const isExpanded = expanded.has(a.id);
          const truncated = a.text.length > 200;
          const shown = !truncated || isExpanded ? a.text : a.text.slice(0, 180) + "…";
          return (
            <article
              key={a.id}
              className="py-4 pl-4 pr-2 mb-3 border-l-2 border rounded-sm"
              style={{ borderLeftColor: hue.border, borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            >
              <div className="flex items-baseline justify-between mb-2">
                <Link
                  href={`/read/${encodeURIComponent(a.book)}/${a.chapter}#v${a.verse}`}
                  className="font-serif text-[15px]"
                  style={{ color: "var(--color-ink)" }}
                >
                  {a.book} {a.chapter}:{a.verse}
                </Link>
                <span className="text-[10px]" style={{ color: "var(--color-ink-faint)" }}>
                  {relativeDate(a.updatedAt)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className="badge" style={{ background: hue.hex, color: hue.border, fontSize: 9 }}>
                  {a.type}
                </span>
                {a.tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTagFilter(t)}
                    className="text-[10px]"
                    style={{ color: "var(--color-ink-faint)" }}
                  >
                    #{t}
                  </button>
                ))}
              </div>
              <p className="text-[13px] leading-[1.6]" style={{ color: "var(--color-ink)" }}>
                {shown}
              </p>
              {truncated && (
                <button
                  onClick={() => {
                    const next = new Set(expanded);
                    if (isExpanded) next.delete(a.id); else next.add(a.id);
                    setExpanded(next);
                  }}
                  className="mt-1 text-[11px]"
                  style={{ color: "var(--color-gold)" }}
                >
                  {isExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4" style={{ background: "var(--color-surface)" }}>
      <div className="t-label" style={{ fontSize: 9 }}>{label}</div>
      <div className="font-serif text-[18px] mt-1 truncate" style={{ color: "var(--color-ink)" }}>
        {value}
      </div>
    </div>
  );
}
