"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";
import { BOOKS } from "@/lib/data/books";

type Chapter = {
  chapter: number;
  sentiment: number;
  contentType: { narrative: number; discourse: number; poetry: number };
  sampleFirstVerse: string;
  verseCount: number;
  dominantTone: "positive" | "neutral" | "negative";
};

type CharacterResponse = {
  book: string;
  chapters: Chapter[];
  notIndexed?: boolean;
};

type Section = "sentiment" | "texture";

export function TextCharacter() {
  const [book, setBook] = useState("Psalms");
  const [compareBook, setCompareBook] = useState<string>("");
  const [section, setSection] = useState<Section>("sentiment");
  const [primary, setPrimary] = useState<CharacterResponse | null>(null);
  const [compare, setCompare] = useState<CharacterResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (b: string): Promise<CharacterResponse | null> => {
    try {
      const res = await fetch(`/api/analytics/character?book=${encodeURIComponent(b)}`);
      if (!res.ok) return null;
      return (await res.json()) as CharacterResponse;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load(book).then((r) => {
      if (!cancelled) {
        setPrimary(r);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [book, load]);

  useEffect(() => {
    if (!compareBook) { setCompare(null); return; }
    let cancelled = false;
    load(compareBook).then((r) => {
      if (!cancelled) setCompare(r);
    });
    return () => { cancelled = true; };
  }, [compareBook, load]);

  const sentimentData = useMemo(() => {
    if (!primary) return [];
    return primary.chapters.map((c) => ({
      chapter: c.chapter,
      primary: c.sentiment,
      primaryPositive: c.sentiment > 0 ? c.sentiment : 0,
      primaryNegative: c.sentiment < 0 ? c.sentiment : 0,
      compare: compare?.chapters.find((x) => x.chapter === c.chapter)?.sentiment ?? null,
      tone: c.dominantTone,
      firstVerse: c.sampleFirstVerse,
      verseCount: c.verseCount,
    }));
  }, [primary, compare]);

  const textureData = useMemo(() => {
    if (!primary) return [];
    return primary.chapters.map((c) => ({
      chapter: `${c.chapter}`,
      narrative: c.contentType.narrative,
      discourse: c.contentType.discourse,
      poetry: c.contentType.poetry,
    }));
  }, [primary]);

  return (
    <div>
      {/* Selector */}
      <div className="flex flex-wrap items-center gap-3 mb-8 pb-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <label className="t-label">Book</label>
        <select value={book} onChange={(e) => setBook(e.target.value)} style={{ maxWidth: 220 }}>
          {BOOKS.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
        </select>

        {section === "sentiment" && (
          <>
            <label className="t-label ml-4">+ Compare</label>
            <select value={compareBook} onChange={(e) => setCompareBook(e.target.value)} style={{ maxWidth: 200 }}>
              <option value="">— none —</option>
              {BOOKS.filter((b) => b.name !== book).map((b) => (
                <option key={b.name} value={b.name}>{b.name}</option>
              ))}
            </select>
          </>
        )}

        <div className="ml-auto flex items-center gap-0 border rounded overflow-hidden" style={{ borderColor: "var(--color-border-strong)" }}>
          {(["sentiment", "texture"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className="h-8 px-4 text-[12px] transition-colors"
              style={{
                background: section === s ? "var(--color-gold-light)" : "transparent",
                color: section === s ? "var(--color-gold)" : "var(--color-ink-muted)",
                borderRight: s !== "texture" ? "1px solid var(--color-border)" : undefined,
              }}
            >
              {s === "sentiment" ? "Sentiment Arc" : "Narrative Texture"}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="space-y-2">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-[320px] w-full" />
        </div>
      )}

      {!loading && primary?.notIndexed && (
        <div className="py-24 text-center border" style={{ borderColor: "var(--color-border)" }}>
          <p className="t-label mb-3">Not yet indexed</p>
          <p className="text-[13px]" style={{ color: "var(--color-ink-muted)" }}>
            {book} isn&apos;t in the database yet. Try Genesis, Psalms, or Isaiah.
          </p>
        </div>
      )}

      {!loading && primary && !primary.notIndexed && section === "sentiment" && (
        <div>
          <div className="mb-3 flex items-baseline gap-3">
            <h2 className="font-serif text-[18px]" style={{ color: "var(--color-ink)" }}>{book}</h2>
            <span className="t-meta">{primary.chapters.length} chapters</span>
            {compareBook && (
              <span className="t-meta">vs {compareBook}</span>
            )}
          </div>
          <div className="border p-4" style={{ borderColor: "var(--color-border)", borderRadius: 4, background: "var(--color-surface)" }}>
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={sentimentData}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="chapter" tick={{ fontSize: 10, fill: "var(--color-ink-faint)" }} stroke="var(--color-border)" />
                <YAxis domain={[-1, 1]} tick={{ fontSize: 10, fill: "var(--color-ink-faint)" }} stroke="var(--color-border)" />
                <ReferenceLine y={0} stroke="var(--color-ink-faint)" strokeDasharray="3 3" label={{ value: "neutral", fontSize: 9, fill: "var(--color-ink-faint)", position: "insideTopRight" }} />
                <Tooltip content={<SentimentTooltip />} />
                <Area type="monotone" dataKey="primaryPositive" fill="var(--color-gold)" fillOpacity={0.25} stroke="var(--color-gold)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="primaryNegative" fill="var(--color-navy)" fillOpacity={0.25} stroke="var(--color-navy)" strokeWidth={1.5} />
                {compare && <Line type="monotone" dataKey="compare" stroke="var(--color-navy)" strokeDasharray="4 3" dot={false} strokeWidth={1.5} />}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!loading && primary && !primary.notIndexed && section === "texture" && (
        <div>
          <div className="mb-3 flex items-baseline gap-3">
            <h2 className="font-serif text-[18px]" style={{ color: "var(--color-ink)" }}>{book}</h2>
            <span className="t-meta">narrative / discourse / poetic mix per chapter</span>
          </div>
          <div className="border p-4" style={{ borderColor: "var(--color-border)", borderRadius: 4, background: "var(--color-surface)" }}>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={textureData} stackOffset="expand">
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="chapter" tick={{ fontSize: 10, fill: "var(--color-ink-faint)" }} stroke="var(--color-border)" />
                <YAxis tickFormatter={(v: number) => `${Math.round(v * 100)}%`} tick={{ fontSize: 10, fill: "var(--color-ink-faint)" }} stroke="var(--color-border)" />
                <Tooltip content={<TextureTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-ink-muted)" }} iconType="square" />
                <Bar dataKey="narrative" stackId="a" fill="var(--color-gold)" name="Narrative" />
                <Bar dataKey="discourse" stackId="a" fill="var(--color-navy)" name="Discourse" />
                <Bar dataKey="poetry" stackId="a" fill="#0F766E" name="Poetry" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

type TooltipPayloadItem = { payload?: Record<string, unknown> };
type RechartsTooltipProps = { active?: boolean; payload?: TooltipPayloadItem[] };

function SentimentTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as Record<string, unknown> | undefined;
  if (!p) return null;
  const chapter = p.chapter as number;
  const primary = p.primary as number;
  const tone = p.tone as string;
  const firstVerse = p.firstVerse as string;
  return (
    <div className="p-3 border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border-strong)", borderRadius: 4, maxWidth: 320 }}>
      <div className="t-label mb-1" style={{ fontSize: 9 }}>
        Chapter {chapter} · {tone}
      </div>
      <div className="text-[11px] mb-2" style={{ color: "var(--color-ink-muted)" }}>
        score {primary >= 0 ? "+" : ""}{primary.toFixed(2)}
      </div>
      <p className="verse-text" style={{ fontSize: 13 }}>{firstVerse}</p>
    </div>
  );
}

function TextureTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as Record<string, unknown> | undefined;
  if (!p) return null;
  return (
    <div className="p-3 border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border-strong)", borderRadius: 4 }}>
      <div className="t-label mb-1" style={{ fontSize: 9 }}>Chapter {p.chapter as string}</div>
      <div className="text-[11px] space-y-0.5" style={{ color: "var(--color-ink-muted)" }}>
        <div>Narrative: {p.narrative as number}%</div>
        <div>Discourse: {p.discourse as number}%</div>
        <div>Poetry: {p.poetry as number}%</div>
      </div>
    </div>
  );
}
