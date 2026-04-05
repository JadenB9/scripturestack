"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type BookMeta, GENRE_COLORS, type Genre, type Testament } from "@/lib/data/books";

const ALL_GENRES: Genre[] = ["Law", "History", "Poetry", "Wisdom", "Prophecy", "Gospel", "Epistle", "Apocalyptic"];

export function BooksGrid({ books }: { books: BookMeta[] }) {
  const [testament, setTestament] = useState<Testament | "All">("All");
  const [genres, setGenres] = useState<Set<Genre>>(new Set());
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return books.filter((b) => {
      if (testament !== "All" && b.testament !== testament) return false;
      if (genres.size > 0 && !genres.has(b.genre)) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (
          !b.name.toLowerCase().includes(q) &&
          !b.author.toLowerCase().includes(q) &&
          !b.theme.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [books, testament, genres, query]);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8 pb-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-0 border rounded overflow-hidden" style={{ borderColor: "var(--color-border-strong)" }}>
          {(["All", "OT", "NT"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTestament(t)}
              className="h-8 px-4 text-[12px] transition-colors"
              style={{
                background: testament === t ? "var(--color-gold-light)" : "transparent",
                color: testament === t ? "var(--color-gold)" : "var(--color-ink-muted)",
                borderRight: t !== "NT" ? "1px solid var(--color-border)" : undefined,
              }}
            >
              {t === "OT" ? "Old Testament" : t === "NT" ? "New Testament" : "All"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {ALL_GENRES.map((g) => {
            const active = genres.has(g);
            return (
              <button
                key={g}
                onClick={() => {
                  const next = new Set(genres);
                  if (active) next.delete(g); else next.add(g);
                  setGenres(next);
                }}
                className="h-7 px-2.5 text-[11px] border rounded transition-colors"
                style={{
                  borderColor: active ? GENRE_COLORS[g] : "var(--color-border)",
                  color: active ? GENRE_COLORS[g] : "var(--color-ink-muted)",
                  background: active ? "var(--color-gold-light)" : "transparent",
                }}
              >
                {g}
              </button>
            );
          })}
        </div>

        <div className="ml-auto w-full sm:w-60">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search author or theme…"
          />
        </div>
      </div>

      {/* Count */}
      <div className="t-meta mb-4">{filtered.length} of 66</div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filtered.map((book) => (
          <BookCard key={book.name} book={book} />
        ))}
      </div>
    </div>
  );
}

function BookCard({ book }: { book: BookMeta }) {
  const color = GENRE_COLORS[book.genre];
  const [tapped, setTapped] = useState(false);

  return (
    <div
      className={`flip-card relative h-[180px] ${tapped ? "is-flipped" : ""}`}
      onClick={() => setTapped((t) => !t)}
    >
      <div className="flip-card-inner">
        {/* FRONT */}
        <div
          className="flip-card-front flex flex-col justify-between p-4 border"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
            borderLeft: `3px solid ${color}`,
            borderRadius: 4,
          }}
        >
          <div>
            <div
              className="font-serif text-[17px] leading-tight"
              style={{ color: "var(--color-ink)" }}
            >
              {book.name}
            </div>
            <div
              className="badge mt-2"
              style={{ background: "var(--color-gold-light)", color, fontSize: 9 }}
            >
              {book.genre}
            </div>
          </div>
          <div className="text-[11px]" style={{ color: "var(--color-ink-faint)" }}>
            {book.chapters} ch · {book.verses} v
          </div>
        </div>

        {/* BACK */}
        <div
          className="flip-card-back flex flex-col justify-between p-4 border"
          style={{
            background: "var(--color-surface)",
            borderColor: color,
            borderRadius: 4,
          }}
        >
          <div>
            <div className="text-[13px] font-medium" style={{ color: "var(--color-ink)" }}>
              {book.author}
            </div>
            <div className="text-[11px] mb-2" style={{ color: "var(--color-ink-faint)" }}>
              {book.dateWritten}
            </div>
            <p className="text-[11px] leading-[1.5] line-clamp-4" style={{ color: "var(--color-ink-muted)" }}>
              {book.theme}
            </p>
          </div>
          <Link
            href={`/read/${encodeURIComponent(book.name)}/1`}
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] mt-2 inline-block"
            style={{ color }}
          >
            Read →
          </Link>
        </div>
      </div>
    </div>
  );
}
