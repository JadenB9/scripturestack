"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { ChapterEvent, ChapterEventType } from "@/lib/data/chapter-events";
import { CHAPTER_EVENTS } from "@/lib/data/chapter-events";

const TYPE_COLORS: Record<ChapterEventType, string> = {
  narrative: "#92400E",
  discourse: "#1E3A5F",
  prophecy: "#6B21A8",
  prayer: "#0F766E",
  miracle: "#059669",
  legal: "#57534E",
  poetic: "#713F12",
};

const GOSPEL_COLORS: Record<string, string> = {
  Matthew: "#6B21A8",
  Mark: "#7F1D1D",
  Luke: "#0F766E",
  John: "#1E3A5F",
};

type Props = {
  events: ChapterEvent[];
  book: string;
  chapter: number;
  onJumpToVerse: (verse: number) => void;
};

export function ChapterTimeline({ events, book, chapter, onJumpToVerse }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [harmony, setHarmony] = useState(false);
  const [width, setWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement>(null);

  const isGospel = ["Matthew", "Mark", "Luke", "John"].includes(book);

  // If harmony mode is on, pull parallel events from other Gospels.
  const harmonyEvents = useMemo(() => {
    if (!harmony || !isGospel) return [];
    const groups = new Set(events.map((e) => e.harmonyGroupId).filter(Boolean));
    return CHAPTER_EVENTS.filter(
      (e) =>
        e.book !== book &&
        e.harmonyGroupId &&
        groups.has(e.harmonyGroupId) &&
        ["Matthew", "Mark", "Luke", "John"].includes(e.book)
    );
  }, [harmony, isGospel, events, book]);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || events.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const height = harmonyEvents.length > 0 ? 100 : 64;
    const margin = { left: 12, right: 12, top: 14, bottom: 12 };
    const maxVerse = Math.max(
      ...events.map((e) => e.verseEnd),
      ...harmonyEvents.map((e) => e.verseEnd),
      1
    );

    const x = d3
      .scaleLinear()
      .domain([1, maxVerse])
      .range([margin.left, width - margin.right]);

    // Axis (verse numbers) — subtle ticks at quarters
    const axis = d3
      .axisBottom(x)
      .tickValues(d3.range(5, maxVerse, 5).concat([maxVerse]))
      .tickSize(3)
      .tickFormat((d) => `${d}`);

    svg
      .append("g")
      .attr("transform", `translate(0, ${harmonyEvents.length > 0 ? 72 : 40})`)
      .call(axis)
      .call((g) => g.select(".domain").attr("stroke", "var(--color-border)"))
      .call((g) => g.selectAll("line").attr("stroke", "var(--color-border)"))
      .call((g) =>
        g
          .selectAll("text")
          .attr("font-size", 9)
          .attr("fill", "var(--color-ink-faint)")
      );

    // Primary row of nodes
    const mainRow = svg
      .append("g")
      .selectAll("g")
      .data(events)
      .join("g")
      .attr("transform", (d) => `translate(${x((d.verseStart + d.verseEnd) / 2)}, ${margin.top + 6})`)
      .style("cursor", "pointer")
      .on("click", (_e, d) => onJumpToVerse(d.verseStart));

    mainRow
      .append("circle")
      .attr("r", 4)
      .attr("fill", (d) => TYPE_COLORS[d.type])
      .attr("stroke", "var(--color-parchment)")
      .attr("stroke-width", 1.5);

    mainRow
      .append("text")
      .attr("y", 16)
      .attr("text-anchor", "middle")
      .attr("font-size", 9)
      .attr("font-family", "var(--font-sans)")
      .attr("fill", "var(--color-ink-muted)")
      .text((d) => d.title.length > 18 ? d.title.slice(0, 16) + "…" : d.title);

    // Harmony row
    if (harmonyEvents.length > 0) {
      const harmonyRow = svg
        .append("g")
        .selectAll("g")
        .data(harmonyEvents)
        .join("g")
        .attr("transform", (d) => `translate(${x((d.verseStart + d.verseEnd) / 2)}, ${margin.top + 48})`)
        .style("cursor", "pointer")
        .on("click", (_e, d) => {
          window.location.href = `/read/${encodeURIComponent(d.book)}/${d.chapter}#v${d.verseStart}`;
        });

      harmonyRow
        .append("circle")
        .attr("r", 3)
        .attr("fill", (d) => GOSPEL_COLORS[d.book] ?? "#57534E");

      harmonyRow
        .append("text")
        .attr("y", 14)
        .attr("text-anchor", "middle")
        .attr("font-size", 8)
        .attr("font-family", "var(--font-sans)")
        .attr("fill", "var(--color-ink-faint)")
        .text((d) => `${d.book.slice(0, 3)} ${d.chapter}`);
    }
  }, [events, harmonyEvents, width, onJumpToVerse]);

  if (events.length === 0) return null;

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center justify-between pt-1">
        <span className="t-label" style={{ fontSize: 9 }}>Chapter flow</span>
        {isGospel && (
          <button
            onClick={() => setHarmony((h) => !h)}
            className="text-[10px] px-2 py-0.5 border rounded"
            style={{
              borderColor: harmony ? "var(--color-gold)" : "var(--color-border)",
              color: harmony ? "var(--color-gold)" : "var(--color-ink-muted)",
            }}
          >
            {harmony ? "Harmony on" : "Gospel harmony"}
          </button>
        )}
      </div>
      <svg ref={svgRef} width={width} height={harmonyEvents.length > 0 ? 100 : 64} />
    </div>
  );
}
