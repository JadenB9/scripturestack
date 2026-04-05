"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BOOKS_BY_NAME } from "@/lib/data/books";

type Result = {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  similarity: number;
};

type SearchResponse = {
  query: string;
  results: Result[];
};

type MapPoint = {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  x: number;
  y: number;
};

export function SemanticSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [highlightIds, setHighlightIds] = useState<Set<number>>(new Set());
  const [hovered, setHovered] = useState<MapPoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load the verse map once on mount.
  useEffect(() => {
    fetch("/api/analytics/verse-map?limit=500")
      .then((r) => r.json())
      .then((d: { points: MapPoint[] }) => {
        setMapPoints(d.points ?? []);
        setMapLoading(false);
      })
      .catch(() => setMapLoading(false));
  }, []);

  const runSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), limit: 20 }),
      });
      const data = (await res.json()) as SearchResponse;
      const list = data.results ?? [];
      setResults(list);
      setHighlightIds(new Set(list.map((r) => r.id)));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  function colorForBook(book: string): string {
    const meta = BOOKS_BY_NAME.get(book);
    if (!meta) return "var(--color-ink-faint)";
    return meta.testament === "OT" ? "var(--color-gold)" : "var(--color-navy)";
  }

  return (
    <div>
      {/* Search input */}
      <div className="mb-10">
        <div className="flex items-center gap-3 border-b-2 pb-3" style={{ borderColor: "var(--color-ink)" }}>
          <SearchIcon />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Search by meaning, not just words…"
            className="flex-1 text-[22px]"
            style={{ border: "none", padding: 0, background: "transparent", color: "var(--color-ink)" }}
          />
          <button onClick={runSearch} className="btn btn-primary">Search</button>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="mb-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
              <div className="skeleton h-3 w-28 mb-2" />
              <div className="skeleton h-4 w-full mb-1" />
              <div className="skeleton h-4 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {!loading && results && results.length === 0 && (
        <p className="t-meta mb-10">No matches yet. Try a different query.</p>
      )}

      {!loading && results && results.length > 0 && (
        <section className="mb-14">
          <div className="t-label mb-3">{results.length} results</div>
          <div>
            {results.map((r, i) => (
              <article
                key={r.id}
                className="fade-in py-4 border-b"
                style={{ borderColor: "var(--color-border)", animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <Link
                    href={`/read/${encodeURIComponent(r.book)}/${r.chapter}#v${r.verse}`}
                    className="font-serif text-[13px]"
                    style={{ color: "var(--color-gold)" }}
                  >
                    {r.book} {r.chapter}:{r.verse}
                  </Link>
                  <span className="badge" style={{
                    background: colorForBook(r.book) === "var(--color-gold)" ? "var(--color-gold-light)" : "var(--color-navy-light)",
                    color: colorForBook(r.book),
                    fontSize: 9,
                  }}>
                    {BOOKS_BY_NAME.get(r.book)?.testament ?? ""}
                  </span>
                </div>
                <p className="verse-text" style={{ fontSize: 15 }}>{r.text}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
                    <div
                      className="h-full"
                      style={{ width: `${Math.round(r.similarity * 100)}%`, background: "var(--color-gold)" }}
                    />
                  </div>
                  <span className="text-[10px]" style={{ color: "var(--color-ink-faint)" }}>
                    {Math.round(r.similarity * 100)}%
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Verse map */}
      <section>
        <div className="t-label mb-3">Verse map</div>
        <p className="text-[12px] mb-4 max-w-[560px]" style={{ color: "var(--color-ink-muted)" }}>
          A 2D projection of verse embeddings. Each dot is a verse; nearby dots share meaning.
          When you search above, matching verses pulse here in gold.
        </p>
        {mapLoading && <div className="skeleton h-[420px] w-full" />}
        {!mapLoading && mapPoints.length === 0 && (
          <div className="py-16 text-center border" style={{ borderColor: "var(--color-border)" }}>
            <p className="t-meta">Verse map will populate once embedding seeding completes.</p>
          </div>
        )}
        {!mapLoading && mapPoints.length > 0 && (
          <div className="flex gap-6">
            <div
              className="flex-1 relative border"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
                borderRadius: 4,
                height: 460,
              }}
            >
              <svg viewBox="-1.1 -1.1 2.2 2.2" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
                {mapPoints.map((p) => {
                  const highlighted = highlightIds.has(p.id);
                  return (
                    <g key={p.id}>
                      {highlighted && (
                        <circle cx={p.x} cy={p.y} r={0.025} fill="none" stroke="var(--color-gold)" strokeWidth={0.006} opacity={0.6}>
                          <animate attributeName="r" values="0.015;0.04;0.015" dur="1.6s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.9;0.1;0.9" dur="1.6s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={0.008}
                        fill={colorForBook(p.book)}
                        fillOpacity={highlighted ? 1 : 0.55}
                        onMouseEnter={() => setHovered(p)}
                        onMouseLeave={() => setHovered((h) => (h?.id === p.id ? null : h))}
                        onClick={() => setSelectedPoint(p)}
                        style={{ cursor: "pointer" }}
                      />
                    </g>
                  );
                })}
              </svg>
              {hovered && (
                <div
                  className="absolute top-3 left-3 px-3 py-1.5 border text-[11px] pointer-events-none"
                  style={{ background: "var(--color-surface)", borderColor: "var(--color-border-strong)", borderRadius: 4, maxWidth: 300 }}
                >
                  <span className="font-serif" style={{ color: "var(--color-gold)" }}>{hovered.book} {hovered.chapter}:{hovered.verse}</span>
                  <div className="mt-1" style={{ color: "var(--color-ink-muted)" }}>{hovered.text.slice(0, 60)}…</div>
                </div>
              )}
            </div>

            {selectedPoint && (
              <aside
                className="w-[300px] border p-4 fade-in"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", borderRadius: 4 }}
              >
                <div className="t-label mb-2">Selected verse</div>
                <div className="font-serif text-[14px] mb-2" style={{ color: "var(--color-gold)" }}>
                  {selectedPoint.book} {selectedPoint.chapter}:{selectedPoint.verse}
                </div>
                <p className="verse-text mb-4" style={{ fontSize: 14 }}>{selectedPoint.text}</p>
                <Link
                  href={`/read/${encodeURIComponent(selectedPoint.book)}/${selectedPoint.chapter}#v${selectedPoint.verse}`}
                  className="text-[11px]"
                  style={{ color: "var(--color-gold)" }}
                >
                  Read in context →
                </Link>
              </aside>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-muted)" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
