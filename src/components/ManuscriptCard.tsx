"use client";

import { useState } from "react";
import type { Manuscript } from "@/lib/data/manuscripts";

export function ManuscriptCard({ manuscript }: { manuscript: Manuscript }) {
  const [expanded, setExpanded] = useState(false);
  const short = manuscript.description.length > 220 && !expanded;
  const shown = short
    ? manuscript.description.slice(0, 210).trimEnd() + "…"
    : manuscript.description;

  return (
    <article
      className="border p-5 flex flex-col"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
        borderRadius: 8,
      }}
    >
      <div
        className="font-serif text-[18px] leading-tight"
        style={{ color: "var(--color-ink)" }}
      >
        {manuscript.name}
      </div>
      <div className="t-meta mt-1">{manuscript.dateRange}</div>

      <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
        <span className="badge badge-gold">{manuscript.language}</span>
      </div>

      <p
        className="text-[13px] leading-[1.65] mb-3"
        style={{ color: "var(--color-ink)" }}
      >
        {shown}
      </p>
      {manuscript.description.length > 220 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-[11px] mb-3 self-start"
          style={{ color: "var(--color-gold)" }}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      <dl className="text-[12px] mb-3 mt-auto space-y-1">
        <div>
          <dt className="t-label inline mr-1" style={{ fontSize: 9 }}>
            Contains
          </dt>
          <dd className="inline" style={{ color: "var(--color-ink-muted)" }}>
            {manuscript.contains}
          </dd>
        </div>
        <div>
          <dt className="t-label inline mr-1" style={{ fontSize: 9 }}>
            Held
          </dt>
          <dd className="inline" style={{ color: "var(--color-ink-muted)" }}>
            {manuscript.locationToday}
          </dd>
        </div>
      </dl>

      <a
        href={manuscript.digitizationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[12px] self-start"
        style={{ color: "var(--color-gold)" }}
      >
        Digitization →
      </a>
    </article>
  );
}
