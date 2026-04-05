"use client";

import Link from "next/link";
import { useState } from "react";
import type { Feast, FeastType, HebrewMonth } from "@/lib/data/hebrew-calendar";

const FEAST_COLORS: Record<FeastType, string> = {
  pilgrimage: "#92400E",
  feast: "#1E3A5F",
  fast: "#78716C",
  "new-moon": "#D6D3D1",
  sabbath: "#0F766E",
};

const FEAST_LABELS: Record<FeastType, string> = {
  pilgrimage: "Pilgrimage",
  feast: "Feast",
  fast: "Fast",
  "new-moon": "New moon",
  sabbath: "Sabbath",
};

export function HebrewCalendarGrid({ months }: { months: HebrewMonth[] }) {
  const [openMonth, setOpenMonth] = useState<number | null>(null);
  const [activeFeast, setActiveFeast] = useState<Feast | null>(null);

  return (
    <div>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {(Object.keys(FEAST_COLORS) as FeastType[]).map((k) => (
          <div key={k} className="flex items-center gap-2">
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: 9999,
                background: FEAST_COLORS[k],
              }}
            />
            <span
              className="text-[11px]"
              style={{ color: "var(--color-ink-muted)" }}
            >
              {FEAST_LABELS[k]}
            </span>
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {months.map((m) => {
          const isOpen = openMonth === m.index;
          return (
            <button
              key={m.index}
              onClick={() => setOpenMonth(isOpen ? null : m.index)}
              className="text-left border p-4 transition-colors"
              style={{
                background: isOpen ? "var(--color-parchment)" : "var(--color-surface)",
                borderColor: isOpen
                  ? "var(--color-gold)"
                  : "var(--color-border)",
                borderRadius: 8,
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div
                    className="font-serif text-[17px] leading-tight"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {m.name}
                  </div>
                  <div
                    className="font-hebrew text-[18px] mt-1"
                    style={{ color: "var(--color-ink-muted)" }}
                  >
                    {m.hebrewName}
                  </div>
                </div>
                <span
                  className="text-[10px] mt-1"
                  style={{ color: "var(--color-ink-faint)" }}
                >
                  {m.index}
                </span>
              </div>
              <div className="t-meta mt-2">{m.gregorian}</div>
              <div className="flex flex-wrap gap-1.5 mt-3 min-h-[12px]">
                {m.feasts.length === 0 ? (
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--color-ink-faint)" }}
                  >
                    no appointed feasts
                  </span>
                ) : (
                  m.feasts.map((f) => (
                    <span
                      key={f.id}
                      title={f.name}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 9999,
                        background: FEAST_COLORS[f.type],
                        display: "inline-block",
                      }}
                    />
                  ))
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded month detail */}
      {openMonth !== null && (() => {
        const month = months.find((m) => m.index === openMonth);
        if (!month) return null;
        return (
          <section
            className="mt-6 border p-6 fade-in"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
              borderRadius: 8,
            }}
          >
            <div className="flex items-baseline justify-between mb-4">
              <h3
                className="font-serif text-[20px]"
                style={{ color: "var(--color-ink)" }}
              >
                {month.name}{" "}
                <span
                  className="font-hebrew"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  {month.hebrewName}
                </span>
              </h3>
              <button
                onClick={() => setOpenMonth(null)}
                className="text-[14px]"
                style={{ color: "var(--color-ink-muted)" }}
              >
                Close ×
              </button>
            </div>

            {month.feasts.length === 0 ? (
              <p
                className="text-[13px]"
                style={{ color: "var(--color-ink-faint)" }}
              >
                No Torah-appointed feasts fall in this month.
              </p>
            ) : (
              <ul>
                {month.feasts.map((f) => (
                  <li
                    key={f.id}
                    className="border-b last:border-b-0 py-3"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <button
                      onClick={() => setActiveFeast(f)}
                      className="w-full text-left grid grid-cols-1 md:grid-cols-[1.5fr_2fr_1fr] md:items-baseline gap-2"
                    >
                      <div>
                        <div
                          className="font-serif text-[16px]"
                          style={{ color: "var(--color-ink)" }}
                        >
                          {f.name}
                        </div>
                        <div
                          className="font-hebrew text-[14px] mt-0.5"
                          style={{ color: "var(--color-ink-muted)" }}
                        >
                          {f.hebrewName}
                        </div>
                      </div>
                      <div
                        className="text-[12px]"
                        style={{ color: "var(--color-ink-muted)" }}
                      >
                        {f.significance.split(". ")[0]}.
                      </div>
                      <div
                        className="text-[11px]"
                        style={{ color: "var(--color-ink-faint)" }}
                      >
                        {f.dayRange} · {f.leviticalReference}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })()}

      {/* Feast detail modal */}
      {activeFeast && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(28, 25, 23, 0.5)" }}
          onClick={() => setActiveFeast(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-[560px] w-full border p-6 fade-in"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
              borderRadius: 8,
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div
                  className="font-serif text-[22px] leading-tight"
                  style={{ color: "var(--color-ink)" }}
                >
                  {activeFeast.name}
                </div>
                <div
                  className="font-hebrew text-[18px] mt-1"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  {activeFeast.hebrewName}
                </div>
              </div>
              <button
                onClick={() => setActiveFeast(null)}
                aria-label="Close"
                className="text-[20px]"
                style={{ color: "var(--color-ink-muted)" }}
              >
                ×
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className="badge"
                style={{
                  background: FEAST_COLORS[activeFeast.type],
                  color: "#fff",
                }}
              >
                {FEAST_LABELS[activeFeast.type]}
              </span>
              <span className="badge badge-muted">{activeFeast.dayRange}</span>
              <span className="badge badge-navy">{activeFeast.leviticalReference}</span>
            </div>
            <p
              className="text-[14px] leading-[1.7] mb-4"
              style={{ color: "var(--color-ink)" }}
            >
              {activeFeast.significance}
            </p>
            {activeFeast.fulfillment && (
              <div
                className="pl-4 py-2 mb-4"
                style={{
                  borderLeft: "2px solid var(--color-navy)",
                  background: "var(--color-navy-light)",
                }}
              >
                <div className="t-label mb-1" style={{ fontSize: 9 }}>
                  Fulfillment
                </div>
                <p
                  className="font-serif text-[14px] leading-[1.65]"
                  style={{ color: "var(--color-ink)" }}
                >
                  {activeFeast.fulfillment}
                </p>
              </div>
            )}
            <div className="t-label mb-2">Passages</div>
            <ul className="space-y-1">
              {activeFeast.passages.map((p, i) => (
                <li key={i}>
                  <Link
                    href={`/read/${encodeURIComponent(p.book)}/${p.chapter}${
                      p.verseStart ? `#v${p.verseStart}` : ""
                    }`}
                    onClick={() => setActiveFeast(null)}
                    className="font-serif text-[14px]"
                    style={{ color: "var(--color-gold)" }}
                  >
                    {p.book} {p.chapter}
                    {p.verseStart
                      ? `:${p.verseStart}${p.verseEnd ? `–${p.verseEnd}` : ""}`
                      : ""}{" "}
                    →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Sabbath cycle timeline */}
      <section className="mt-14">
        <h2 className="t-h2 mb-2">Sabbath Cycle</h2>
        <p
          className="text-[13px] mb-4 max-w-[620px]"
          style={{ color: "var(--color-ink-muted)" }}
        >
          Every seventh year the land rested (Leviticus 25:4); every fiftieth year — after seven cycles of seven — was the Jubilee, when debts were released and inheritances restored.
        </p>
        <SabbathTimeline />
      </section>
    </div>
  );
}

function SabbathTimeline() {
  // Render a 50-year span showing Sabbatical years (every 7th) and Jubilee at year 50.
  const years = Array.from({ length: 50 }, (_, i) => i + 1);
  const width = 900;
  const height = 110;
  const paddingX = 30;
  const usable = width - paddingX * 2;
  const step = usable / 49;

  return (
    <div
      className="border p-4 overflow-x-auto"
      style={{
        borderColor: "var(--color-border)",
        background: "var(--color-surface)",
        borderRadius: 8,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block", minWidth: width }}
      >
        <line
          x1={paddingX}
          x2={width - paddingX}
          y1={height / 2}
          y2={height / 2}
          stroke="var(--color-border-strong)"
          strokeWidth={1}
        />
        {years.map((y, i) => {
          const cx = paddingX + i * step;
          const isSabbatical = y % 7 === 0 && y !== 50;
          const isJubilee = y === 50;
          const r = isJubilee ? 9 : isSabbatical ? 6 : 3;
          const fill = isJubilee
            ? "#92400E"
            : isSabbatical
              ? "#1E3A5F"
              : "#D6D3D1";
          return (
            <g key={y}>
              <circle cx={cx} cy={height / 2} r={r} fill={fill} />
              {(isSabbatical || isJubilee) && (
                <text
                  x={cx}
                  y={height / 2 - 14}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily="var(--font-sans)"
                  fill="var(--color-ink-muted)"
                >
                  {isJubilee ? "Jubilee" : `Yr ${y}`}
                </text>
              )}
            </g>
          );
        })}
        <text
          x={paddingX}
          y={height - 10}
          fontSize={10}
          fontFamily="var(--font-sans)"
          fill="var(--color-ink-faint)"
        >
          Year 1
        </text>
        <text
          x={width - paddingX}
          y={height - 10}
          fontSize={10}
          fontFamily="var(--font-sans)"
          fill="var(--color-ink-faint)"
          textAnchor="end"
        >
          Year 50
        </text>
      </svg>
    </div>
  );
}
