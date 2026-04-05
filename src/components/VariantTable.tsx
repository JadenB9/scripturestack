"use client";

import { useMemo, useState } from "react";
import type {
  TextualVariant,
  VariantSignificance,
} from "@/lib/data/manuscripts";

type SigFilter = "All" | VariantSignificance;

const SIG_COLORS: Record<VariantSignificance, { bg: string; fg: string }> = {
  significant: { bg: "#FEE2E2", fg: "#991B1B" },
  moderate: { bg: "#FEF3C7", fg: "#92400E" },
  minor: { bg: "#E7E5E4", fg: "#57534E" },
};

export function VariantTable({ variants }: { variants: TextualVariant[] }) {
  const [sig, setSig] = useState<SigFilter>("All");
  const [manuscriptFilter, setManuscriptFilter] = useState<string>("");
  const [bookFilter, setBookFilter] = useState<string>("");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allManuscripts = useMemo(() => {
    const set = new Set<string>();
    for (const v of variants) {
      for (const r of v.readings) for (const w of r.witnesses) set.add(w);
    }
    return [...set].sort();
  }, [variants]);

  const allBooks = useMemo(() => {
    return [...new Set(variants.map((v) => v.book))].sort();
  }, [variants]);

  const filtered = useMemo(() => {
    return variants.filter((v) => {
      if (sig !== "All" && v.significance !== sig) return false;
      if (bookFilter && v.book !== bookFilter) return false;
      if (manuscriptFilter) {
        const hit = v.readings.some((r) =>
          r.witnesses.some((w) => w === manuscriptFilter),
        );
        if (!hit) return false;
      }
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const hay =
          v.passage.toLowerCase() +
          " " +
          v.note.toLowerCase() +
          " " +
          v.readings.map((r) => r.text.toLowerCase()).join(" ");
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [variants, sig, manuscriptFilter, bookFilter, query]);

  return (
    <div>
      {/* Filter bar */}
      <div
        className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="flex items-center gap-0 border overflow-hidden"
          style={{ borderColor: "var(--color-border-strong)", borderRadius: 4 }}
        >
          {(["All", "significant", "moderate", "minor"] as const).map((s, i) => (
            <button
              key={s}
              onClick={() => setSig(s)}
              className="h-8 px-3 text-[11px] transition-colors"
              style={{
                background:
                  sig === s ? "var(--color-gold-light)" : "transparent",
                color: sig === s ? "var(--color-gold)" : "var(--color-ink-muted)",
                borderRight:
                  i !== 3 ? "1px solid var(--color-border)" : undefined,
                textTransform: "capitalize",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <select
          value={manuscriptFilter}
          onChange={(e) => setManuscriptFilter(e.target.value)}
          className="text-[12px]"
          style={{ maxWidth: 200 }}
        >
          <option value="">All manuscripts</option>
          {allManuscripts.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={bookFilter}
          onChange={(e) => setBookFilter(e.target.value)}
          className="text-[12px]"
          style={{ maxWidth: 160 }}
        >
          <option value="">All books</option>
          {allBooks.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <div className="ml-auto w-full sm:w-60">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search text or notes…"
          />
        </div>
      </div>

      <div className="t-meta mb-3">
        {filtered.length} variant{filtered.length === 1 ? "" : "s"}
      </div>

      {/* Table */}
      <div
        className="border"
        style={{ borderColor: "var(--color-border)", borderRadius: 8 }}
      >
        <div
          className="grid grid-cols-[2fr_1fr_2fr_3fr] gap-3 px-4 py-2 border-b"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-parchment)",
          }}
        >
          <div className="t-label">Passage</div>
          <div className="t-label">Significance</div>
          <div className="t-label">Manuscripts</div>
          <div className="t-label">Note</div>
        </div>

        {filtered.map((v) => {
          const isOpen = expandedId === v.id;
          const allWitnesses = [
            ...new Set(v.readings.flatMap((r) => r.witnesses)),
          ];
          const witnessLabel =
            allWitnesses.slice(0, 2).join(", ") +
            (allWitnesses.length > 2 ? ` +${allWitnesses.length - 2}` : "");
          const sigColor = SIG_COLORS[v.significance];

          return (
            <div
              key={v.id}
              className="border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <button
                onClick={() => setExpandedId(isOpen ? null : v.id)}
                className="w-full text-left grid grid-cols-[2fr_1fr_2fr_3fr] gap-3 px-4 py-3 items-center"
                style={{ background: isOpen ? "var(--color-parchment)" : "transparent" }}
              >
                <div
                  className="font-serif text-[14px]"
                  style={{ color: "var(--color-ink)" }}
                >
                  {v.passage}
                </div>
                <div>
                  <span
                    className="badge"
                    style={{
                      background: sigColor.bg,
                      color: sigColor.fg,
                    }}
                  >
                    {v.significance}
                  </span>
                </div>
                <div
                  className="text-[12px] truncate"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  {witnessLabel}
                </div>
                <div
                  className="text-[12px] truncate"
                  style={{ color: "var(--color-ink-muted)" }}
                >
                  {v.note}
                </div>
              </button>

              {isOpen && (
                <div
                  className="px-4 pb-5 pt-1"
                  style={{ background: "var(--color-parchment)" }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {v.readings.map((r, i) => (
                      <div
                        key={i}
                        className="pl-4 py-2"
                        style={{
                          borderLeft: "2px solid var(--color-gold)",
                          background: "var(--color-surface)",
                        }}
                      >
                        <div
                          className="t-label mb-1"
                          style={{ fontSize: 10 }}
                        >
                          {r.label}
                        </div>
                        <p
                          className="font-serif text-[15px] leading-[1.7] mb-2"
                          style={{ color: "var(--color-ink)" }}
                        >
                          {r.text}
                        </p>
                        <div
                          className="text-[11px]"
                          style={{ color: "var(--color-ink-faint)" }}
                        >
                          Witnesses: {r.witnesses.join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    className="mt-4 text-[13px] leading-[1.65]"
                    style={{ color: "var(--color-ink)" }}
                  >
                    <span className="t-label mr-2">Note</span>
                    {v.note}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div
            className="px-4 py-10 text-center text-[13px]"
            style={{ color: "var(--color-ink-faint)" }}
          >
            No variants match these filters.
          </div>
        )}
      </div>
    </div>
  );
}
