"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import {
  COVENANTS,
  EPOCHS,
  TIMELINE_EVENTS,
  type Covenant,
  type TimelineEpoch,
  type TimelineEvent,
} from "@/lib/data/timeline";

const YEAR_MIN = -4100;
const YEAR_MAX = 100;
const CHART_HEIGHT = 520;
const MARGIN = { top: 48, right: 24, bottom: 48, left: 24 };

type Selection =
  | { kind: "event"; event: TimelineEvent }
  | { kind: "covenant"; covenant: Covenant }
  | null;

type TooltipState = {
  x: number;
  y: number;
  event: TimelineEvent;
} | null;

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BC`;
  if (year === 0) return "1 BC / AD 1";
  return `AD ${year}`;
}

export function MacroTimeline() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const baseScaleRef = useRef<d3.ScaleLinear<number, number> | null>(null);

  const [width, setWidth] = useState<number>(1000);
  const [showCovenants, setShowCovenants] = useState(false);
  const [selection, setSelection] = useState<Selection>(null);
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  // Track container width via ResizeObserver
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(600, Math.floor(entry.contentRect.width));
        setWidth(w);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

  const baseScale = useMemo(
    () => d3.scaleLinear().domain([YEAR_MIN, YEAR_MAX]).range([0, innerWidth]),
    [innerWidth]
  );

  // Keep a ref so zoom handlers can always read the latest base scale
  useEffect(() => {
    baseScaleRef.current = baseScale;
  }, [baseScale]);

  // Main render effect — rebuilds when width changes or covenant toggle flips.
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    // Clip path so bands don't bleed into the margins on zoom
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "macro-clip")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", innerWidth)
      .attr("height", innerHeight);

    const zoomG = g.append("g").attr("clip-path", "url(#macro-clip)");

    // --- Epoch bands ---
    const epochBandHeight = innerHeight - 120;
    const epochBandY = 60;

    const epochSel = zoomG
      .append("g")
      .attr("class", "epochs")
      .selectAll<SVGGElement, TimelineEpoch>("g")
      .data(EPOCHS, (d) => d.id)
      .join("g")
      .attr("class", "epoch");

    epochSel
      .append("rect")
      .attr("y", epochBandY)
      .attr("height", epochBandHeight)
      .attr("fill", (d) => d.color)
      .attr("fill-opacity", 0.35)
      .attr("stroke", "var(--color-border)")
      .attr("stroke-width", 1);

    epochSel
      .append("text")
      .attr("class", "epoch-label")
      .attr("y", epochBandY + 14)
      .attr("font-family", "var(--font-sans)")
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .attr("letter-spacing", "0.08em")
      .attr("text-transform", "uppercase")
      .attr("fill", "var(--color-ink-muted)")
      .style("text-transform", "uppercase")
      .text((d) => d.name.toUpperCase());

    // --- Baseline axis line ---
    const axisY = epochBandY + epochBandHeight / 2;
    zoomG
      .append("line")
      .attr("class", "baseline")
      .attr("y1", axisY)
      .attr("y2", axisY)
      .attr("stroke", "var(--color-border-strong)")
      .attr("stroke-width", 1);

    // --- Axis (years) ---
    const axisGroup = g
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight - 28})`);

    // --- Covenant layer (dashed verticals + arrows) ---
    const covG = zoomG
      .append("g")
      .attr("class", "covenants")
      .attr("opacity", showCovenants ? 1 : 0)
      .attr("pointer-events", showCovenants ? "all" : "none");

    const covMarkers = covG
      .selectAll<SVGGElement, Covenant>("g.covenant")
      .data(COVENANTS, (d) => d.id)
      .join("g")
      .attr("class", "covenant")
      .style("cursor", "pointer")
      .on("click", (_event, d) => {
        setSelection({ kind: "covenant", covenant: d });
      });

    covMarkers
      .append("line")
      .attr("class", "cov-line")
      .attr("y1", epochBandY - 6)
      .attr("y2", epochBandY + epochBandHeight + 6)
      .attr("stroke", "var(--color-gold)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3 3");

    covMarkers
      .append("circle")
      .attr("class", "cov-dot")
      .attr("cy", epochBandY - 6)
      .attr("r", 4)
      .attr("fill", "var(--color-parchment)")
      .attr("stroke", "var(--color-gold)")
      .attr("stroke-width", 1.5);

    covMarkers
      .append("text")
      .attr("class", "cov-label")
      .attr("y", epochBandY - 14)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-sans)")
      .attr("font-size", 10)
      .attr("fill", "var(--color-gold)")
      .text((d) => d.name.replace(" Covenant", ""));

    // Arrows between covenants — curved path
    const arrowPaths = covG
      .append("g")
      .attr("class", "cov-arrows")
      .selectAll<SVGPathElement, [Covenant, Covenant]>("path")
      .data(
        COVENANTS.slice(0, -1).map((c, i) => [c, COVENANTS[i + 1]] as [Covenant, Covenant])
      )
      .join("path")
      .attr("fill", "none")
      .attr("stroke", "var(--color-gold)")
      .attr("stroke-width", 0.75)
      .attr("stroke-opacity", 0.55);

    // --- Events (circles) ---
    const eventSel = zoomG
      .append("g")
      .attr("class", "events")
      .selectAll<SVGCircleElement, TimelineEvent>("circle")
      .data(TIMELINE_EVENTS, (d) => d.id)
      .join("circle")
      .attr("class", "event-dot")
      .attr("cy", axisY)
      .attr("r", (d) => 3 + d.importance * 1.5)
      .attr("fill", (d) => (d.year < 0 ? "var(--color-gold)" : "var(--color-navy)"))
      .attr("fill-opacity", 0.88)
      .attr("stroke", "var(--color-parchment)")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseenter", function (this: SVGCircleElement, event: MouseEvent, d: TimelineEvent) {
        const rect = wrapRef.current?.getBoundingClientRect();
        if (!rect) return;
        d3.select(this).attr("stroke", "var(--color-ink)").attr("stroke-width", 1.5);
        setTooltip({
          x: event.clientX - rect.left + 12,
          y: event.clientY - rect.top + 12,
          event: d,
        });
      })
      .on("mousemove", (event: MouseEvent, d: TimelineEvent) => {
        const rect = wrapRef.current?.getBoundingClientRect();
        if (!rect) return;
        setTooltip({
          x: event.clientX - rect.left + 12,
          y: event.clientY - rect.top + 12,
          event: d,
        });
      })
      .on("mouseleave", function (this: SVGCircleElement) {
        d3.select(this).attr("stroke", "var(--color-parchment)").attr("stroke-width", 1);
        setTooltip(null);
      })
      .on("click", (_event: MouseEvent, d: TimelineEvent) => {
        setSelection({ kind: "event", event: d });
      });

    // --- Zoom ---
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 60])
      .translateExtent([
        [0, 0],
        [innerWidth, innerHeight],
      ])
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ])
      .on("zoom", (ev) => {
        const base = baseScaleRef.current;
        if (!base) return;
        const zx = ev.transform.rescaleX(base);

        epochSel
          .select<SVGRectElement>("rect")
          .attr("x", (d) => zx(d.startYear))
          .attr("width", (d) => Math.max(0, zx(d.endYear) - zx(d.startYear)));

        epochSel
          .select<SVGTextElement>("text")
          .attr("x", (d) => (zx(d.startYear) + zx(d.endYear)) / 2)
          .attr("opacity", (d) => {
            const w = zx(d.endYear) - zx(d.startYear);
            return w < 40 ? 0 : 1;
          });

        zoomG.select<SVGLineElement>(".baseline").attr("x1", zx(YEAR_MIN)).attr("x2", zx(YEAR_MAX));

        eventSel.attr("cx", (d) => zx(d.year));

        covMarkers.attr("transform", (d) => `translate(${zx(d.year)},0)`);

        arrowPaths.attr("d", (pair) => {
          const [a, b] = pair;
          const x1 = zx(a.year);
          const x2 = zx(b.year);
          const y = epochBandY - 24;
          const mx = (x1 + x2) / 2;
          const my = y - 14;
          return `M${x1},${y} Q${mx},${my} ${x2},${y}`;
        });

        const axis = d3
          .axisBottom<number>(zx)
          .ticks(Math.max(4, Math.floor(innerWidth / 110)))
          .tickFormat((v) => formatYear(v as number));
        axisGroup.call(axis);
        axisGroup.selectAll("path, line").attr("stroke", "var(--color-border-strong)");
        axisGroup
          .selectAll("text")
          .attr("fill", "var(--color-ink-muted)")
          .attr("font-family", "var(--font-sans)")
          .attr("font-size", 10);
      });

    zoomRef.current = zoom;
    svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

    return () => {
      svg.on(".zoom", null);
    };
  }, [width, innerWidth, innerHeight, showCovenants]);

  // Quick-zoom to an epoch
  const zoomToEpoch = useCallback(
    (epoch: TimelineEpoch) => {
      if (!svgRef.current) return;
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
      const zoom = zoomRef.current;
      const base = baseScaleRef.current;
      if (!zoom || !base) return;

      const pad = (epoch.endYear - epoch.startYear) * 0.08;
      const x0 = base(epoch.startYear - pad);
      const x1 = base(epoch.endYear + pad);
      const span = Math.max(1, x1 - x0);
      const k = Math.min(60, Math.max(1, innerWidth / span));
      const tx = innerWidth / 2 - ((x0 + x1) / 2) * k;

      svg
        .transition()
        .duration(720)
        .ease(d3.easeCubicInOut)
        .call(zoom.transform, d3.zoomIdentity.translate(tx, 0).scale(k));
    },
    [innerWidth]
  );

  const resetZoom = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    const zoom = zoomRef.current;
    if (!zoom) return;
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
  }, []);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setShowCovenants((v) => !v)}
          className="h-8 px-3 text-[12px] border rounded transition-colors"
          style={{
            borderColor: showCovenants ? "var(--color-gold)" : "var(--color-border-strong)",
            color: showCovenants ? "var(--color-gold)" : "var(--color-ink-muted)",
            background: showCovenants ? "var(--color-gold-light)" : "transparent",
          }}
        >
          {showCovenants ? "Hide covenants" : "Show covenants"}
        </button>
        <button
          onClick={resetZoom}
          className="h-8 px-3 text-[12px] border rounded transition-colors"
          style={{ borderColor: "var(--color-border-strong)", color: "var(--color-ink-muted)" }}
        >
          Reset view
        </button>
        <div className="ml-2 text-[11px]" style={{ color: "var(--color-ink-faint)" }}>
          Scroll to zoom · drag to pan
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {EPOCHS.map((e) => (
          <button
            key={e.id}
            onClick={() => zoomToEpoch(e)}
            className="h-7 px-2 text-[10px] border rounded transition-colors"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-ink-muted)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {e.name}
          </button>
        ))}
      </div>

      {/* Chart wrapper */}
      <div
        ref={wrapRef}
        className="relative border"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface)",
          borderRadius: 4,
        }}
      >
        <svg
          ref={svgRef}
          width={width}
          height={CHART_HEIGHT}
          style={{ display: "block", userSelect: "none" }}
        />

        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute border"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              background: "var(--color-surface)",
              borderColor: "var(--color-border-strong)",
              padding: "6px 8px",
              borderRadius: 2,
              maxWidth: 240,
              zIndex: 20,
            }}
          >
            <div className="font-serif text-[12px]" style={{ color: "var(--color-ink)" }}>
              {tooltip.event.name}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "var(--color-ink-muted)" }}>
              {formatYear(tooltip.event.year)} · {tooltip.event.passage.book} {tooltip.event.passage.chapter}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-[11px]" style={{ color: "var(--color-ink-muted)" }}>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block"
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--color-gold)",
            }}
          />
          OT event
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block"
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--color-navy)",
            }}
          />
          NT event
        </span>
        <span className="t-label" style={{ fontSize: 10 }}>
          {TIMELINE_EVENTS.length} events · {EPOCHS.length} epochs · {COVENANTS.length} covenants
        </span>
      </div>

      {/* Side panel */}
      {selection && (
        <aside
          className="panel-slide fixed border-l"
          style={{
            top: 56,
            right: 0,
            bottom: 0,
            width: 340,
            background: "var(--color-surface)",
            borderLeftColor: "var(--color-border-strong)",
            zIndex: 40,
            overflowY: "auto",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <p className="t-label">
              {selection.kind === "event" ? "Event" : "Covenant"}
            </p>
            <button
              onClick={() => setSelection(null)}
              className="text-[18px] leading-none"
              style={{ color: "var(--color-ink-faint)" }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="px-5 py-5">
            {selection.kind === "event" ? (
              <EventPanelBody event={selection.event} />
            ) : (
              <CovenantPanelBody covenant={selection.covenant} />
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

function EventPanelBody({ event }: { event: TimelineEvent }) {
  const epoch = EPOCHS.find((e) => e.id === event.epochId);
  return (
    <>
      <h2 className="font-serif text-[20px] leading-tight" style={{ color: "var(--color-ink)" }}>
        {event.name}
      </h2>
      <div className="flex items-center gap-2 mt-2 mb-4">
        <span className="badge badge-gold">{formatYear(event.year)}</span>
        {epoch && (
          <span className="badge badge-muted" style={{ fontSize: 9 }}>
            {epoch.name}
          </span>
        )}
      </div>
      <Link
        href={`/read/${encodeURIComponent(event.passage.book)}/${event.passage.chapter}`}
        className="font-serif text-[14px] inline-block mb-4"
        style={{ color: "var(--color-gold)" }}
      >
        {event.passage.book} {event.passage.chapter}
        {event.passage.verseStart ? `:${event.passage.verseStart}` : ""} →
      </Link>
      <p className="text-[13px] leading-[1.65]" style={{ color: "var(--color-ink-muted)" }}>
        {event.description}
      </p>
    </>
  );
}

function CovenantPanelBody({ covenant }: { covenant: Covenant }) {
  return (
    <>
      <h2 className="font-serif text-[20px] leading-tight" style={{ color: "var(--color-ink)" }}>
        {covenant.name}
      </h2>
      <div className="flex items-center gap-2 mt-2 mb-5">
        <span className="badge badge-gold">{formatYear(covenant.year)}</span>
        <span className="badge badge-muted" style={{ fontSize: 9 }}>
          {covenant.status === "active" ? "Active" : "Fulfilled · Expanded"}
        </span>
      </div>

      <dl className="space-y-3 text-[13px]">
        <div>
          <dt className="t-label" style={{ fontSize: 9 }}>Parties</dt>
          <dd className="mt-0.5" style={{ color: "var(--color-ink)" }}>{covenant.parties}</dd>
        </div>
        <div>
          <dt className="t-label" style={{ fontSize: 9 }}>Promise</dt>
          <dd
            className="mt-0.5 leading-[1.6]"
            style={{ color: "var(--color-ink-muted)" }}
          >
            {covenant.promise}
          </dd>
        </div>
        <div>
          <dt className="t-label" style={{ fontSize: 9 }}>Sign</dt>
          <dd className="mt-0.5" style={{ color: "var(--color-ink)" }}>{covenant.sign}</dd>
        </div>
      </dl>

      <Link
        href={`/read/${encodeURIComponent(covenant.passage.book)}/${covenant.passage.chapter}`}
        className="font-serif text-[14px] inline-block mt-5"
        style={{ color: "var(--color-gold)" }}
      >
        {covenant.passage.book} {covenant.passage.chapter} →
      </Link>
    </>
  );
}
