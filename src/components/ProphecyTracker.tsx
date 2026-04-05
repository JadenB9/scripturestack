"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  Prophecy,
  ProphecyCategory,
  ProphecyStatus,
} from "@/lib/data/prophecies";
import { BOOKS } from "@/lib/data/books";

const STATUS_COLORS: Record<ProphecyStatus, string> = {
  fulfilled: "#059669",
  partial: "#D97706",
  future: "#A8A29E",
};

const STATUS_LABELS: Record<ProphecyStatus, string> = {
  fulfilled: "Fulfilled",
  partial: "Partial",
  future: "Awaiting",
};

const CATEGORIES: Array<ProphecyCategory> = [
  "Messianic",
  "Israel",
  "Gentiles",
  "Judgment",
  "Restoration",
  "End Times",
];

const BOOK_ORDER: Record<string, number> = Object.fromEntries(
  BOOKS.map((b, i) => [b.name, i]),
);

type StatusFilter = "All" | ProphecyStatus;
type SortMode = "canonical" | "category" | "status";

export function ProphecyTracker({ prophecies }: { prophecies: Prophecy[] }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [bookFilter, setBookFilter] = useState<string>("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("canonical");
  const [openId, setOpenId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = prophecies.length;
    const fulfilled = prophecies.filter((p) => p.status === "fulfilled").length;
    const partial = prophecies.filter((p) => p.status === "partial").length;
    const future = prophecies.filter((p) => p.status === "future").length;
    return { total, fulfilled, partial, future };
  }, [prophecies]);

  const filtered = useMemo(() => {
    let list = [...prophecies];
    if (statusFilter !== "All") list = list.filter((p) => p.status === statusFilter);
    if (categoryFilter)
      list = list.filter((p) => p.category === categoryFilter);
    if (bookFilter) list = list.filter((p) => p.otReference.book === bookFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.otText.toLowerCase().includes(q) ||
          (p.ntText ?? "").toLowerCase().includes(q) ||
          p.notes.toLowerCase().includes(q),
      );
    }
    if (sort === "canonical") {
      list.sort((a, b) => {
        const ao = BOOK_ORDER[a.otReference.book] ?? 99;
        const bo = BOOK_ORDER[b.otReference.book] ?? 99;
        if (ao !== bo) return ao - bo;
        return a.otReference.chapter - b.otReference.chapter;
      });
    } else if (sort === "category") {
      list.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sort === "status") {
      const order: Record<ProphecyStatus, number> = {
        fulfilled: 0,
        partial: 1,
        future: 2,
      };
      list.sort((a, b) => order[a.status] - order[b.status]);
    }
    return list;
  }, [prophecies, statusFilter, categoryFilter, bookFilter, query, sort]);

  const pctFulfilled = stats.total
    ? Math.round((stats.fulfilled / stats.total) * 100)
    : 0;

  const allBooks = useMemo(
    () => [...new Set(prophecies.map((p) => p.otReference.book))].sort(
      (a, b) => (BOOK_ORDER[a] ?? 99) - (BOOK_ORDER[b] ?? 99),
    ),
    [prophecies],
  );

  return (
    <div>
      {/* Stats row */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-[1px] mb-6"
        style={{ background: "var(--color-border)" }}
      >
        <StatCard
          label="Total prophecies"
          value={stats.total.toString()}
        />
        <StatCard
          label="Fulfilled"
          value={stats.fulfilled.toString()}
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M3 8.5 L6.5 12 L13 4.5"
                stroke="#059669"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <StatCard
          label="Awaiting fulfillment"
          value={(stats.partial + stats.future).toString()}
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle
                cx="8"
                cy="8"
                r="6.25"
                stroke="#D97706"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M8 4.5 L8 8 L10.5 9.5"
                stroke="#D97706"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          }
        />
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1.5">
          <span className="t-label">Fulfillment</span>
          <span
            className="text-[12px]"
            style={{ color: "var(--color-ink-muted)" }}
          >
            {pctFulfilled}% fulfilled
          </span>
        </div>
        <div
          className="h-2 w-full"
          style={{ background: "var(--color-border)", borderRadius: 2 }}
        >
          <div
            style={{
              width: `${pctFulfilled}%`,
              height: "100%",
              background: "var(--color-gold)",
              borderRadius: 2,
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-3 mb-5 pb-4 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="flex items-center gap-0 border overflow-hidden"
          style={{ borderColor: "var(--color-border-strong)", borderRadius: 4 }}
        >
          {(["All", "fulfilled", "partial", "future"] as const).map((s, i) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="h-8 px-3 text-[11px] transition-colors"
              style={{
                background:
                  statusFilter === s ? "var(--color-gold-light)" : "transparent",
                color:
                  statusFilter === s
                    ? "var(--color-gold)"
                    : "var(--color-ink-muted)",
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
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-[12px]"
          style={{ maxWidth: 160 }}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
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

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="text-[12px]"
          style={{ maxWidth: 160 }}
        >
          <option value="canonical">Sort: book order</option>
          <option value="category">Sort: category</option>
          <option value="status">Sort: status</option>
        </select>

        <div className="ml-auto w-full sm:w-60">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prophecies…"
          />
        </div>
      </div>

      <div className="t-meta mb-3">
        {filtered.length} prophec{filtered.length === 1 ? "y" : "ies"}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {filtered.map((p) => {
          const isOpen = openId === p.id;
          const dot = STATUS_COLORS[p.status];
          const refStr = `${p.otReference.book} ${p.otReference.chapter}${
            p.otReference.verseStart ? `:${p.otReference.verseStart}` : ""
          }${p.otReference.verseEnd ? `–${p.otReference.verseEnd}` : ""}`;
          return (
            <article
              key={p.id}
              className="border"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
                borderRadius: 8,
              }}
            >
              <button
                onClick={() => setOpenId(isOpen ? null : p.id)}
                className="w-full text-left flex items-center gap-3 px-4 py-3"
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: 10,
                    borderRadius: 9999,
                    background: dot,
                    flexShrink: 0,
                  }}
                />
                <span
                  className="text-[11px] uppercase"
                  style={{
                    color: dot,
                    letterSpacing: "0.05em",
                    fontWeight: 500,
                    minWidth: 70,
                  }}
                >
                  {STATUS_LABELS[p.status]}
                </span>
                <span
                  className="font-serif text-[15px] flex-1"
                  style={{ color: "var(--color-ink)", fontWeight: 500 }}
                >
                  {p.title}
                </span>
                <span className="badge badge-muted hidden sm:inline-flex">
                  {refStr}
                </span>
                <span className="badge badge-navy hidden md:inline-flex">
                  {p.category}
                </span>
              </button>

              {isOpen && (
                <div
                  className="px-4 pb-5 pt-1 border-t"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div
                    className={`grid gap-5 mt-4 ${
                      p.ntText ? "md:grid-cols-2" : "grid-cols-1"
                    }`}
                  >
                    <div
                      className="pl-4"
                      style={{ borderLeft: "2px solid var(--color-gold)" }}
                    >
                      <div className="t-label mb-1" style={{ fontSize: 9 }}>
                        Old Testament
                      </div>
                      <Link
                        href={`/read/${encodeURIComponent(
                          p.otReference.book,
                        )}/${p.otReference.chapter}${
                          p.otReference.verseStart
                            ? `#v${p.otReference.verseStart}`
                            : ""
                        }`}
                        className="text-[12px]"
                        style={{ color: "var(--color-gold)" }}
                      >
                        {refStr} →
                      </Link>
                      <p
                        className="font-serif text-[15px] leading-[1.7] mt-2"
                        style={{ color: "var(--color-ink)" }}
                      >
                        {p.otText}
                      </p>
                    </div>
                    {p.ntText && p.ntFulfillment && (
                      <div
                        className="pl-4"
                        style={{ borderLeft: "2px solid var(--color-navy)" }}
                      >
                        <div className="t-label mb-1" style={{ fontSize: 9 }}>
                          Fulfillment
                        </div>
                        <Link
                          href={`/read/${encodeURIComponent(
                            p.ntFulfillment.book,
                          )}/${p.ntFulfillment.chapter}${
                            p.ntFulfillment.verseStart
                              ? `#v${p.ntFulfillment.verseStart}`
                              : ""
                          }`}
                          className="text-[12px]"
                          style={{ color: "var(--color-navy)" }}
                        >
                          {p.ntFulfillment.book} {p.ntFulfillment.chapter}
                          {p.ntFulfillment.verseStart
                            ? `:${p.ntFulfillment.verseStart}${
                                p.ntFulfillment.verseEnd
                                  ? `–${p.ntFulfillment.verseEnd}`
                                  : ""
                              }`
                            : ""}{" "}
                          →
                        </Link>
                        <p
                          className="font-serif text-[15px] leading-[1.7] mt-2"
                          style={{ color: "var(--color-ink)" }}
                        >
                          {p.ntText}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2 mb-2">
                    <span className="badge badge-navy">{p.category}</span>
                    <span className="badge badge-muted">
                      {STATUS_LABELS[p.status]}
                    </span>
                  </div>
                  <p
                    className="text-[13px] leading-[1.65]"
                    style={{ color: "var(--color-ink-muted)" }}
                  >
                    {p.notes}
                  </p>
                </div>
              )}
            </article>
          );
        })}

        {filtered.length === 0 && (
          <div
            className="py-12 text-center text-[13px]"
            style={{ color: "var(--color-ink-faint)" }}
          >
            No prophecies match these filters.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="p-5" style={{ background: "var(--color-surface)" }}>
      <div className="t-label" style={{ fontSize: 10 }}>
        {label}
      </div>
      <div className="flex items-baseline gap-2 mt-1.5">
        <span
          className="font-serif text-[28px] leading-none"
          style={{ color: "var(--color-ink)" }}
        >
          {value}
        </span>
        {icon}
      </div>
    </div>
  );
}
