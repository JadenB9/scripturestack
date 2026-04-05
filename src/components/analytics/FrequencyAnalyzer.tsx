"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BOOKS } from "@/lib/data/books";
import { DOCTRINES } from "@/lib/data/doctrines";

type Tab = "words" | "doctrine";

type FrequencyWord = {
  word: string;
  count: number;
  sample: Array<{ chapter: number; verse: number; text: string }>;
};

type FrequencyResponse = {
  book: string;
  from: number | null;
  to: number | null;
  totalWords: number;
  totalVerses: number;
  words: FrequencyWord[];
  notIndexed: boolean;
};

type HeatmapRow = {
  word: string;
  cells: Array<{ book: string; count: number; perThousand: number }>;
};

type HeatmapResponse = {
  rows: HeatmapRow[];
  books: string[];
};

type DoctrineCell = {
  doctrineId: string;
  rawCount: number;
  perThousand: number;
  sample: Array<{ chapter: number; verse: number; text: string; matchedKeyword: string }>;
};

type DoctrineRow = {
  book: string;
  totalWords: number;
  cells: DoctrineCell[];
};

type DoctrineResponse = {
  books: string[];
  doctrines: Array<{ id: string; label: string }>;
  rows: DoctrineRow[];
};

export function FrequencyAnalyzer() {
  const [tab, setTab] = useState<Tab>("words");

  return (
    <div>
      <div className="segment w-fit mb-8">
        {(["words", "doctrine"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? "is-active" : ""}
          >
            {t === "words" ? "Word Frequency" : "Doctrine Map"}
          </button>
        ))}
      </div>

      {tab === "words" ? <WordFrequencyTab /> : <DoctrineMapTab />}
    </div>
  );
}

/* ───────────────────────── Word Frequency Tab ───────────────────────── */

function WordFrequencyTab() {
  const [book, setBook] = useState("Psalms");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<FrequencyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<FrequencyWord | null>(null);

  const [heatmap, setHeatmap] = useState<HeatmapResponse | null>(null);
  const [heatmapTestament, setHeatmapTestament] = useState<"ALL" | "OT" | "NT">("NT");

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedWord(null);
    try {
      const params = new URLSearchParams({ book });
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await fetch(`/api/analytics/frequency?${params.toString()}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const json = (await res.json()) as FrequencyResponse;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [book, from, to]);

  // Initial load with defaults
  useEffect(() => {
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Heatmap loads after we have top words
  useEffect(() => {
    if (!data || data.words.length === 0) return;
    const topWords = data.words.slice(0, 10).map((w) => w.word);
    const controller = new AbortController();
    const load = async () => {
      try {
        const params = new URLSearchParams({
          words: topWords.join(","),
          testament: heatmapTestament,
        });
        const res = await fetch(`/api/analytics/frequency/heatmap?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const json = (await res.json()) as HeatmapResponse;
        setHeatmap(json);
      } catch {
        /* ignore */
      }
    };
    load();
    return () => controller.abort();
  }, [data, heatmapTestament]);

  const chartData = useMemo(
    () => (data?.words ?? []).slice(0, 30).map((w) => ({ word: w.word, count: w.count })),
    [data],
  );

  return (
    <div>
      {/* Passage selector */}
      <div className="flex flex-wrap items-end gap-4 mb-8 pb-6 border-b"
           style={{ borderColor: "var(--color-border)" }}>
        <div className="flex flex-col min-w-[200px]">
          <label className="t-label mb-1">Book</label>
          <select value={book} onChange={(e) => setBook(e.target.value)}>
            {BOOKS.map((b) => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col w-[90px]">
          <label className="t-label mb-1">From ch.</label>
          <input
            type="number"
            min={1}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="—"
          />
        </div>
        <div className="flex flex-col w-[90px]">
          <label className="t-label mb-1">To ch.</label>
          <input
            type="number"
            min={1}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="—"
          />
        </div>
        <button onClick={runAnalysis} className="btn btn-primary" disabled={loading}>
          {loading ? "Analyzing…" : "Analyze"}
        </button>
        {data && !data.notIndexed && (
          <div className="ml-auto text-[12px]" style={{ color: "var(--color-ink-muted)" }}>
            {data.totalVerses.toLocaleString()} verses · {data.totalWords.toLocaleString()} words
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 text-[13px]" style={{ color: "var(--ann-red-b)" }}>
          Analysis failed: {error}
        </div>
      )}

      {loading && !data && <ChartSkeleton />}

      {data && data.notIndexed && (
        <div className="py-16 text-center border" style={{ borderColor: "var(--color-border)" }}>
          <p className="t-label mb-2">Not yet indexed</p>
          <p className="text-[13px]" style={{ color: "var(--color-ink-muted)" }}>
            {book} is not yet in the verses database. Try a different book.
          </p>
        </div>
      )}

      {data && !data.notIndexed && data.words.length > 0 && (
        <>
          <section className="mb-10">
            <h2 className="t-h2 mb-4">Top content words</h2>
            <div className="border p-4" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: 8 }}>
              <ResponsiveContainer width="100%" height={460}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
                >
                  <CartesianGrid horizontal={false} stroke="var(--color-border)" />
                  <XAxis
                    type="number"
                    stroke="var(--color-ink-faint)"
                    tick={{ fontSize: 11, fill: "var(--color-ink-muted)" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="word"
                    width={100}
                    stroke="var(--color-ink-faint)"
                    tick={{ fontSize: 11, fill: "var(--color-ink-muted)", fontFamily: "var(--font-serif)" }}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-gold-light)" }}
                    contentStyle={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border-strong)",
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "var(--color-ink)", fontFamily: "var(--font-serif)" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-gold)"
                    radius={[0, 2, 2, 0]}
                    onClick={((datum: unknown) => {
                      const p = (datum as { payload?: FrequencyWord })?.payload;
                      if (p) setSelectedWord(p);
                    }) as never}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {selectedWord && (
              <div
                className="mt-4 border p-5"
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: 4 }}
              >
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="t-label">Verses with</span>{" "}
                    <span className="font-serif text-[18px]" style={{ color: "var(--color-gold)" }}>
                      {selectedWord.word}
                    </span>
                    <span className="ml-2 text-[11px]" style={{ color: "var(--color-ink-faint)" }}>
                      ({selectedWord.count} occurrences)
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedWord(null)}
                    className="text-[11px]"
                    style={{ color: "var(--color-ink-faint)" }}
                  >
                    Close
                  </button>
                </div>
                <ul>
                  {selectedWord.sample.slice(0, 6).map((s) => (
                    <li key={`${s.chapter}-${s.verse}`} className="mb-3">
                      <Link
                        href={`/read/${encodeURIComponent(book)}/${s.chapter}#v${s.verse}`}
                        className="text-[11px]"
                        style={{ color: "var(--color-gold)" }}
                      >
                        {book} {s.chapter}:{s.verse} →
                      </Link>
                      <p
                        className="font-serif text-[14px] mt-1 leading-[1.6]"
                        style={{ color: "var(--color-ink)" }}
                        dangerouslySetInnerHTML={{
                          __html: highlightWord(s.text, selectedWord.word),
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="t-h2">Across the canon</h2>
              <div className="flex items-center gap-0 border rounded overflow-hidden"
                   style={{ borderColor: "var(--color-border-strong)" }}>
                {(["ALL", "OT", "NT"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setHeatmapTestament(t)}
                    className="h-7 px-3 text-[11px] transition-colors"
                    style={{
                      background: heatmapTestament === t ? "var(--color-gold-light)" : "transparent",
                      color: heatmapTestament === t ? "var(--color-gold)" : "var(--color-ink-muted)",
                      borderRight: t !== "NT" ? "1px solid var(--color-border)" : undefined,
                    }}
                  >
                    {t === "ALL" ? "All" : t === "OT" ? "OT" : "NT"}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[12px] mb-3" style={{ color: "var(--color-ink-muted)" }}>
              Frequency of the top 10 words per 1000 words in each book.
            </p>
            <Heatmap data={heatmap} />
          </section>
        </>
      )}
    </div>
  );
}

function highlightWord(text: string, word: string): string {
  const escaped = text.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
  const re = new RegExp(`\\b(${word})\\b`, "gi");
  return escaped.replace(
    re,
    '<mark style="background: var(--color-gold-light); color: var(--color-gold); padding: 0 2px;">$1</mark>',
  );
}

function Heatmap({ data }: { data: HeatmapResponse | null }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!data || data.rows.length === 0) {
    return (
      <div ref={ref} className="border p-4" style={{ borderColor: "var(--color-border)", height: 240 }}>
        <div className="skeleton h-full w-full" />
      </div>
    );
  }

  const maxIntensity = Math.max(
    ...data.rows.flatMap((r) => r.cells.map((c) => c.perThousand)),
    0.001,
  );

  const labelWidth = 110;
  const available = Math.max(containerWidth - labelWidth, 200);
  const cellWidth = Math.max(Math.floor(available / data.books.length), 14);
  const cellHeight = 28;

  return (
    <div
      ref={ref}
      className="border p-4 overflow-x-auto"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: 8 }}
    >
      <div style={{ width: labelWidth + cellWidth * data.books.length }}>
        {/* Book labels header */}
        <div className="flex" style={{ paddingLeft: labelWidth }}>
          {data.books.map((b) => (
            <div
              key={b}
              className="text-[8px] text-center overflow-hidden"
              style={{
                width: cellWidth,
                color: "var(--color-ink-faint)",
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                height: 70,
                lineHeight: `${cellWidth}px`,
                paddingBottom: 4,
              }}
              title={b}
            >
              {b}
            </div>
          ))}
        </div>

        {/* Rows */}
        {data.rows.map((row) => (
          <div key={row.word} className="flex items-center">
            <div
              className="text-[11px] font-serif pr-3 text-right"
              style={{ width: labelWidth, color: "var(--color-ink)" }}
            >
              {row.word}
            </div>
            {row.cells.map((cell) => {
              const intensity = cell.perThousand / maxIntensity;
              const bg = intensityColor(intensity);
              return (
                <div
                  key={cell.book}
                  title={`${cell.book}: ${cell.count} (${cell.perThousand.toFixed(1)} / 1000)`}
                  className="flex items-center justify-center text-[8px]"
                  style={{
                    width: cellWidth,
                    height: cellHeight,
                    background: bg,
                    color: intensity > 0.5 ? "#fff" : "var(--color-ink-faint)",
                    borderRight: "1px solid var(--color-surface)",
                    borderBottom: "1px solid var(--color-surface)",
                  }}
                >
                  {cell.count > 0 ? cell.count : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function intensityColor(t: number): string {
  // From parchment → gold. We return a color-mix() so it respects dark mode.
  const pct = Math.round(Math.max(0, Math.min(1, t)) * 100);
  return `color-mix(in oklab, var(--color-gold) ${pct}%, var(--color-parchment))`;
}

function ChartSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 26, width: `${100 - i * 6}%` }} />
      ))}
    </div>
  );
}

/* ───────────────────────── Doctrine Map Tab ───────────────────────── */

type SortMode = "canonical" | string;

function DoctrineMapTab() {
  const [data, setData] = useState<DoctrineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortMode>("canonical");
  const [selected, setSelected] = useState<{
    book: string;
    doctrine: { id: string; label: string };
    cell: DoctrineCell;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/doctrine-map`);
        if (res.ok) setData((await res.json()) as DoctrineResponse);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const orderedRows = useMemo(() => {
    if (!data) return [];
    if (sortBy === "canonical") return data.rows;
    const idx = data.doctrines.findIndex((d) => d.id === sortBy);
    if (idx < 0) return data.rows;
    return [...data.rows].sort((a, b) => b.cells[idx].perThousand - a.cells[idx].perThousand);
  }, [data, sortBy]);

  const maxIntensity = useMemo(() => {
    if (!data) return 0;
    let m = 0;
    for (const row of data.rows) {
      for (const cell of row.cells) {
        if (cell.perThousand > m) m = cell.perThousand;
      }
    }
    return m || 0.001;
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 24, width: "100%" }} />
        ))}
      </div>
    );
  }

  if (!data || data.rows.every((r) => r.totalWords === 0)) {
    return (
      <div className="py-16 text-center border" style={{ borderColor: "var(--color-border)" }}>
        <p className="t-label mb-2">Not yet indexed</p>
        <p className="text-[13px]" style={{ color: "var(--color-ink-muted)" }}>
          The NT books are not yet in the verses database.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="t-label">21+ books × 12 doctrines · keyword hits per 1000 words</div>
          <div className="flex items-center gap-2">
            <span className="t-label">Sort books by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-[12px]"
              style={{ width: 160 }}
            >
              <option value="canonical">Canonical</option>
              {data.doctrines.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="border overflow-auto"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: 8 }}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="t-label text-left p-3" style={{ minWidth: 140 }}>Book</th>
                {data.doctrines.map((d) => (
                  <th
                    key={d.id}
                    className="t-label text-center p-2"
                    style={{ minWidth: 64, fontSize: 9 }}
                  >
                    <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", lineHeight: 1.1, height: 60, display: "inline-block" }}>
                      {d.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orderedRows.map((row) => (
                <tr key={row.book} style={{ borderTop: "1px solid var(--color-border)" }}>
                  <td
                    className="font-serif text-[13px] p-3"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {row.book}
                  </td>
                  {row.cells.map((cell) => {
                    const intensity = cell.perThousand / maxIntensity;
                    const bg = intensityColor(intensity);
                    const doctrine = DOCTRINES.find((d) => d.id === cell.doctrineId)!;
                    return (
                      <td
                        key={cell.doctrineId}
                        onClick={() => setSelected({ book: row.book, doctrine: { id: doctrine.id, label: doctrine.label }, cell })}
                        className="p-0 cursor-pointer"
                        title={`${row.book} — ${doctrine.label}: ${cell.rawCount} hits (${cell.perThousand.toFixed(1)} / 1000)`}
                      >
                        <div
                          className="flex items-center justify-center text-[9px]"
                          style={{
                            height: 36,
                            background: bg,
                            color: intensity > 0.5 ? "#fff" : "var(--color-ink-muted)",
                          }}
                        >
                          {cell.perThousand > 0 ? cell.perThousand.toFixed(1) : "·"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <aside
          className="w-[340px] border p-5 panel-slide self-start sticky top-6"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: 8 }}
        >
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="t-label">{selected.book}</div>
              <div className="font-serif text-[18px]" style={{ color: "var(--color-gold)" }}>
                {selected.doctrine.label}
              </div>
              <div className="text-[11px]" style={{ color: "var(--color-ink-faint)" }}>
                {selected.cell.rawCount} hits · {selected.cell.perThousand.toFixed(1)} per 1000
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-[11px]"
              style={{ color: "var(--color-ink-faint)" }}
            >
              Close
            </button>
          </div>
          {selected.cell.sample.length === 0 ? (
            <p className="text-[12px]" style={{ color: "var(--color-ink-muted)" }}>
              No direct matches in this book.
            </p>
          ) : (
            <ul>
              {selected.cell.sample.map((s) => (
                <li key={`${s.chapter}-${s.verse}`} className="mb-3">
                  <Link
                    href={`/read/${encodeURIComponent(selected.book)}/${s.chapter}#v${s.verse}`}
                    className="text-[11px]"
                    style={{ color: "var(--color-gold)" }}
                  >
                    {selected.book} {s.chapter}:{s.verse} →
                  </Link>
                  <p
                    className="font-serif text-[13px] mt-1 leading-[1.55]"
                    style={{ color: "var(--color-ink)" }}
                    dangerouslySetInnerHTML={{ __html: highlightWord(s.text, s.matchedKeyword) }}
                  />
                </li>
              ))}
            </ul>
          )}
        </aside>
      )}
    </div>
  );
}
