"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AUTHORS, RADAR_AXES, type AuthorProfile } from "@/lib/data/authors";

type Ranked = { id: string; name: string; similarity: number; signature: string };

const AUTHOR_COLORS: Record<string, string> = {
  paul: "#92400E",
  john: "#1E3A5F",
  luke: "#0F766E",
  peter: "#713F12",
  matthew: "#6B21A8",
  mark: "#7F1D1D",
  james: "#57534E",
};

export function AuthorshipFingerprint() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [ranked, setRanked] = useState<Ranked[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const comparisonData = useMemo(() => {
    return RADAR_AXES.map((ax) => {
      const row: Record<string, number | string> = { metric: ax.label };
      for (const a of AUTHORS) row[a.name] = Number((a.metrics[ax.key] * 100).toFixed(0));
      return row;
    });
  }, []);

  const analyze = useCallback(async () => {
    if (text.trim().length < 20) {
      setError("Paste at least a couple of sentences (20+ characters).");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/authorship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = (await res.json()) as { ranked: Ranked[] };
      setRanked(data.ranked);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [text]);

  return (
    <div>
      {/* Radar charts */}
      <section className="mb-14">
        <h2 className="t-h2 mb-6">Seven authors, six axes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AUTHORS.map((a) => (
            <AuthorRadar key={a.id} author={a} />
          ))}
        </div>
      </section>

      {/* Comparison bar chart */}
      <section className="mb-14">
        <h2 className="t-h2 mb-2">Side by side</h2>
        <p className="text-[12px] mb-4" style={{ color: "var(--color-ink-muted)" }}>
          Each metric plotted for all seven authors. Look for the outliers — they tell you who each writer is.
        </p>
        <div className="border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", borderRadius: 4 }}>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={comparisonData}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="metric" tick={{ fontSize: 10, fill: "var(--color-ink-faint)" }} stroke="var(--color-border)" />
              <YAxis tick={{ fontSize: 10, fill: "var(--color-ink-faint)" }} stroke="var(--color-border)" />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border-strong)",
                  borderRadius: 4,
                  fontSize: 11,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-ink-muted)" }} iconType="square" />
              {AUTHORS.map((a) => (
                <Bar key={a.id} dataKey={a.name} fill={AUTHOR_COLORS[a.id]} radius={[2, 2, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Mystery text tool */}
      <section>
        <h2 className="t-h2 mb-2">Mystery text</h2>
        <p className="text-[12px] mb-4 max-w-[560px]" style={{ color: "var(--color-ink-muted)" }}>
          Paste any passage — from scripture, a sermon, a commentary, anywhere. The engine scores it
          on the same six axes and ranks the closest matching NT author.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste any passage here to identify its likely author…"
          className="w-full min-h-[140px] text-[14px] leading-[1.6] font-serif"
          style={{
            background: "var(--color-surface)",
            color: "var(--color-ink)",
            border: "1px solid var(--color-border)",
            borderRadius: 4,
            padding: 14,
            resize: "vertical",
          }}
        />
        <div className="mt-3 flex items-center gap-3">
          <button onClick={analyze} disabled={loading} className="btn btn-primary">
            {loading ? "Analyzing…" : "Analyze"}
          </button>
          {error && <span className="text-[12px]" style={{ color: "#991B1B" }}>{error}</span>}
        </div>

        {ranked && ranked.length > 0 && (
          <div className="mt-6 border p-5" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", borderRadius: 4 }}>
            <div className="t-label mb-3">Most likely author</div>
            <div className="font-serif text-[24px] mb-1" style={{ color: "var(--color-ink)" }}>
              {ranked[0].name}
            </div>
            <p className="text-[12px] italic mb-5" style={{ color: "var(--color-ink-muted)" }}>
              {ranked[0].signature}
            </p>

            <div className="space-y-2">
              {ranked.map((r, i) => (
                <div key={r.id} className="flex items-center gap-3">
                  <div className="text-[12px] w-[68px]" style={{ color: "var(--color-ink)" }}>{r.name}</div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.round(r.similarity * 100)}%`,
                        background: i === 0 ? "var(--color-gold)" : AUTHOR_COLORS[r.id],
                      }}
                    />
                  </div>
                  <div className="text-[11px] w-10 text-right" style={{ color: "var(--color-ink-faint)" }}>
                    {Math.round(r.similarity * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function AuthorRadar({ author }: { author: AuthorProfile }) {
  const data = RADAR_AXES.map((ax) => ({
    axis: ax.label,
    value: Number((author.metrics[ax.key] * 100).toFixed(0)),
  }));
  const color = AUTHOR_COLORS[author.id] ?? "var(--color-gold)";
  return (
    <div className="border p-4" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", borderRadius: 4 }}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="font-serif text-[16px]" style={{ color: "var(--color-ink)" }}>{author.name}</div>
        <div className="text-[10px]" style={{ color: "var(--color-ink-faint)" }}>{author.books.length} book{author.books.length > 1 ? "s" : ""}</div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9, fill: "var(--color-ink-muted)" }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.15} strokeWidth={1.5} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
