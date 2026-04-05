"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "ss-last-read";

export type LastRead = {
  book: string;
  chapter: number;
  verse?: number;
  ts: number;
};

export function recordLastRead(entry: LastRead) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {}
}

export function getLastRead(): LastRead | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LastRead;
  } catch {
    return null;
  }
}

export function ContinueReading() {
  const [last, setLast] = useState<LastRead | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLast(getLastRead());
  }, []);

  if (!mounted || !last) return null;

  return (
    <section className="mb-14">
      <div className="t-label mb-3">Continue reading</div>
      <Link
        href={`/read/${encodeURIComponent(last.book)}/${last.chapter}`}
        className="inline-flex items-baseline gap-3 border-b pb-2 transition-colors"
        style={{ borderColor: "var(--color-border)" }}
      >
        <span className="font-serif text-[22px]" style={{ color: "var(--color-ink)" }}>
          {last.book}
        </span>
        <span className="font-serif text-[22px]" style={{ color: "var(--color-gold)" }}>
          {last.chapter}
        </span>
        <span className="text-[12px] ml-2" style={{ color: "var(--color-ink-faint)" }}>
          resume →
        </span>
      </Link>
    </section>
  );
}
