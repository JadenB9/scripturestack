"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { BOOKS, type Testament } from "@/lib/data/books";
import { CROSS_REFERENCES, type CrossRef, type VerseRef } from "@/lib/data/cross-references";

const CHART_HEIGHT = 700;
const MAX_RADIUS = 18;

type NodeDatum = d3.SimulationNodeDatum & {
  id: string;
  ref: VerseRef;
  degree: number;
  r: number;
  testament: Testament;
  color: string;
};

type LinkDatum = d3.SimulationLinkDatum<NodeDatum> & {
  voteCount: number;
  sourceId: string;
  targetId: string;
};

type TestamentFilter = "OT" | "NT" | "Both";

const BOOK_TESTAMENT: Map<string, Testament> = new Map(
  BOOKS.map((b) => [b.name, b.testament])
);

function verseKey(v: VerseRef): string {
  return `${v.book}-${v.chapter}-${v.verse}`;
}

function prettyRef(v: VerseRef): string {
  return `${v.book} ${v.chapter}:${v.verse}`;
}

/** Parse "Romans 8:28" or "John 3:16" into a VerseRef. */
function parseRef(input: string): VerseRef | null {
  const match = input.trim().match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!match) return null;
  const name = match[1].trim();
  const book = BOOKS.find(
    (b) => b.name.toLowerCase() === name.toLowerCase() || b.abbr.toLowerCase() === name.toLowerCase()
  );
  if (!book) return null;
  return { book: book.name, chapter: parseInt(match[2], 10), verse: parseInt(match[3], 10) };
}

export function CrossRefGraph() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const linksGRef = useRef<SVGGElement | null>(null);
  const nodesGRef = useRef<SVGGElement | null>(null);
  const simRef = useRef<d3.Simulation<NodeDatum, LinkDatum> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const currentTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

  const [width, setWidth] = useState<number>(1000);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);

  // Filters
  const [testament, setTestament] = useState<TestamentFilter>("Both");
  const [minVotes, setMinVotes] = useState<number>(1);
  const [bookFilter, setBookFilter] = useState<Set<string>>(new Set());
  const [showBookMenu, setShowBookMenu] = useState(false);

  // ResizeObserver
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(Math.max(600, Math.floor(entry.contentRect.width)));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Build nodes & links
  const { nodes, links, adjacency } = useMemo(() => {
    const nodeMap = new Map<string, NodeDatum>();
    const degreeMap = new Map<string, number>();
    const adj = new Map<string, Set<string>>();

    const addTouch = (v: VerseRef) => {
      const key = verseKey(v);
      degreeMap.set(key, (degreeMap.get(key) ?? 0) + 1);
      if (!nodeMap.has(key)) {
        const testamentForBook = BOOK_TESTAMENT.get(v.book) ?? "OT";
        nodeMap.set(key, {
          id: key,
          ref: v,
          degree: 0,
          r: 4,
          testament: testamentForBook,
          color: testamentForBook === "OT" ? "var(--color-gold)" : "var(--color-navy)",
        });
      }
    };

    for (const cr of CROSS_REFERENCES) {
      addTouch(cr.from);
      addTouch(cr.to);
    }

    for (const [id, n] of nodeMap) {
      const degree = degreeMap.get(id) ?? 1;
      n.degree = degree;
      n.r = Math.min(MAX_RADIUS, 4 + degree * 0.8);
    }

    const linkList: LinkDatum[] = CROSS_REFERENCES.map((cr: CrossRef) => {
      const s = verseKey(cr.from);
      const t = verseKey(cr.to);
      if (!adj.has(s)) adj.set(s, new Set());
      if (!adj.has(t)) adj.set(t, new Set());
      adj.get(s)!.add(t);
      adj.get(t)!.add(s);
      return {
        source: s,
        target: t,
        sourceId: s,
        targetId: t,
        voteCount: cr.voteCount,
      };
    });

    return { nodes: Array.from(nodeMap.values()), links: linkList, adjacency: adj };
  }, []);

  // Build lookup for cross-references from a given verse
  const refsByNode = useMemo(() => {
    const map = new Map<string, { target: NodeDatum; voteCount: number }[]>();
    const byId = new Map(nodes.map((n) => [n.id, n]));
    for (const cr of CROSS_REFERENCES) {
      const fromKey = verseKey(cr.from);
      const toKey = verseKey(cr.to);
      const fromNode = byId.get(fromKey);
      const toNode = byId.get(toKey);
      if (!fromNode || !toNode) continue;
      if (!map.has(fromKey)) map.set(fromKey, []);
      if (!map.has(toKey)) map.set(toKey, []);
      map.get(fromKey)!.push({ target: toNode, voteCount: cr.voteCount });
      map.get(toKey)!.push({ target: fromNode, voteCount: cr.voteCount });
    }
    for (const list of map.values()) {
      list.sort((a, b) => b.voteCount - a.voteCount);
    }
    return map;
  }, [nodes]);

  // List of unique books (for the book filter)
  const availableBooks = useMemo(() => {
    const s = new Set<string>();
    for (const n of nodes) s.add(n.ref.book);
    return [...s].sort((a, b) => {
      const ai = BOOKS.findIndex((bk) => bk.name === a);
      const bi = BOOKS.findIndex((bk) => bk.name === b);
      return ai - bi;
    });
  }, [nodes]);

  // Initial simulation — run until alpha settles, then set positions.
  useEffect(() => {
    if (width <= 0) return;
    const cx = width / 2;
    const cy = CHART_HEIGHT / 2;

    const sim = d3
      .forceSimulation<NodeDatum>(nodes)
      .force(
        "link",
        d3
          .forceLink<NodeDatum, LinkDatum>(links)
          .id((d) => d.id)
          .distance(60)
          .strength(0.55)
      )
      .force("charge", d3.forceManyBody<NodeDatum>().strength(-80))
      .force("center", d3.forceCenter(cx, cy))
      .force("collide", d3.forceCollide<NodeDatum>().radius((d) => d.r + 4))
      .stop();

    // Advance simulation until alpha < 0.001
    let iter = 0;
    while (sim.alpha() > 0.001 && iter < 600) {
      sim.tick();
      iter++;
    }

    simRef.current = sim;
    // Trigger a render by setting a state tick — easier: just call applyLayout directly
    applyLayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, links, width]);

  // Apply the currently held simulation positions to the DOM
  const applyLayout = useCallback(() => {
    const g = d3.select(gRef.current);
    if (!g.node()) return;

    const linkSel = d3
      .select(linksGRef.current)
      .selectAll<SVGLineElement, LinkDatum>("line.edge")
      .data(links, (d) => `${d.sourceId}→${d.targetId}`);

    linkSel.exit().remove();

    const linkEnter = linkSel
      .enter()
      .append("line")
      .attr("class", "edge")
      .attr("stroke", "var(--color-ink)")
      .attr("stroke-width", 0.5);

    const linkMerged = linkEnter.merge(linkSel);

    const nodeSel = d3
      .select(nodesGRef.current)
      .selectAll<SVGGElement, NodeDatum>("g.node")
      .data(nodes, (d) => d.id);

    nodeSel.exit().remove();

    const nodeEnter = nodeSel
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer");

    nodeEnter
      .append("circle")
      .attr("class", "node-ring")
      .attr("fill", "none")
      .attr("stroke", "var(--color-gold)")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0);

    nodeEnter
      .append("circle")
      .attr("class", "node-dot")
      .attr("r", (d) => d.r)
      .attr("fill", (d) => d.color)
      .attr("stroke", "var(--color-parchment)")
      .attr("stroke-width", 1);

    nodeEnter
      .append("text")
      .attr("class", "node-label")
      .attr("font-family", "var(--font-sans)")
      .attr("font-size", 9)
      .attr("fill", "var(--color-ink-muted)")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => -d.r - 4)
      .attr("pointer-events", "none")
      .text((d) => (d.degree >= 3 ? prettyRef(d.ref) : ""));

    const nodeMerged = nodeEnter.merge(nodeSel);

    nodeMerged.on("click", (_event, d) => {
      setSelectedId(d.id);
    });

    // Position nodes
    nodeMerged.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);

    linkMerged
      .attr("x1", (d) => (typeof d.source === "object" ? (d.source as NodeDatum).x ?? 0 : 0))
      .attr("y1", (d) => (typeof d.source === "object" ? (d.source as NodeDatum).y ?? 0 : 0))
      .attr("x2", (d) => (typeof d.target === "object" ? (d.target as NodeDatum).x ?? 0 : 0))
      .attr("y2", (d) => (typeof d.target === "object" ? (d.target as NodeDatum).y ?? 0 : 0));

    updateVisibility();
  }, [nodes, links]);

  // Apply filters, highlight state, and viewport culling to edge + node opacity
  const updateVisibility = useCallback(() => {
    if (!linksGRef.current || !nodesGRef.current) return;

    // Determine which nodes pass filters
    const passes = (n: NodeDatum): boolean => {
      if (testament !== "Both" && n.testament !== testament) return false;
      if (bookFilter.size > 0 && !bookFilter.has(n.ref.book)) return false;
      return true;
    };

    // Highlight sets (direct + second degree)
    let directSet: Set<string> | null = null;
    let secondSet: Set<string> | null = null;
    if (highlightId) {
      directSet = new Set(adjacency.get(highlightId) ?? []);
      secondSet = new Set<string>();
      for (const d of directSet) {
        for (const s of adjacency.get(d) ?? []) {
          if (s !== highlightId && !directSet.has(s)) secondSet.add(s);
        }
      }
    }

    // Viewport rect (in world coordinates)
    const t = currentTransformRef.current;
    const x0 = (-t.x) / t.k;
    const y0 = (-t.y) / t.k;
    const x1 = (width - t.x) / t.k;
    const y1 = (CHART_HEIGHT - t.y) / t.k;

    const inViewport = (n: NodeDatum): boolean => {
      const nx = n.x ?? 0;
      const ny = n.y ?? 0;
      return nx >= x0 - 40 && nx <= x1 + 40 && ny >= y0 - 40 && ny <= y1 + 40;
    };

    d3.select(nodesGRef.current)
      .selectAll<SVGGElement, NodeDatum>("g.node")
      .each(function (d) {
        const sel = d3.select<SVGGElement, NodeDatum>(this);
        const filterPass = passes(d);
        let opacity = filterPass ? 1 : 0.08;
        let fill = d.color;

        if (highlightId) {
          if (d.id === highlightId) {
            opacity = 1;
            fill = "var(--color-gold)";
          } else if (directSet && directSet.has(d.id)) {
            opacity = filterPass ? 1 : 0.2;
          } else if (secondSet && secondSet.has(d.id)) {
            opacity = filterPass ? 0.4 : 0.08;
          } else {
            opacity = filterPass ? 0.1 : 0.05;
          }
        }

        sel.attr("opacity", opacity);
        sel.select<SVGCircleElement>("circle.node-dot").attr("fill", fill);

        // Pulse ring only on the highlighted node
        const ring = sel.select<SVGCircleElement>("circle.node-ring");
        if (d.id === highlightId) {
          ring.attr("r", d.r + 4).attr("opacity", 0.9);
        } else {
          ring.attr("opacity", 0);
        }
      });

    d3.select(linksGRef.current)
      .selectAll<SVGLineElement, LinkDatum>("line.edge")
      .each(function (d) {
        const sEl = typeof d.source === "object" ? (d.source as NodeDatum) : null;
        const tEl = typeof d.target === "object" ? (d.target as NodeDatum) : null;
        if (!sEl || !tEl) return;

        const votePass = d.voteCount >= minVotes;
        const sPass = passes(sEl);
        const tPass = passes(tEl);
        const sView = inViewport(sEl);
        const tView = inViewport(tEl);

        let op = 0;
        if (votePass && sPass && tPass && (sView || tView)) {
          // Base opacity scaled by vote count (stronger edges more visible)
          op = 0.15 + Math.min(0.35, d.voteCount * 0.03);

          if (highlightId) {
            const touchesHighlight = sEl.id === highlightId || tEl.id === highlightId;
            const secondHop =
              (directSet && (directSet.has(sEl.id) || directSet.has(tEl.id))) ?? false;
            if (touchesHighlight) op = 0.85;
            else if (secondHop) op = 0.4;
            else op = 0.08;
          }
        }

        d3.select(this).attr("stroke-opacity", op);
      });
  }, [testament, bookFilter, minVotes, highlightId, adjacency, width]);

  // Re-apply layout when simulation settles (width changes)
  useEffect(() => {
    applyLayout();
  }, [applyLayout, width]);

  // Update visibility whenever filters/highlight change
  useEffect(() => {
    updateVisibility();
  }, [updateVisibility]);

  // Zoom / pan
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 5])
      .on("zoom", (ev) => {
        currentTransformRef.current = ev.transform;
        if (gRef.current) {
          d3.select(gRef.current).attr("transform", ev.transform.toString());
        }
        updateVisibility();
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    return () => {
      svg.on(".zoom", null);
    };
  }, [updateVisibility]);

  // Recenter on a specific node id
  const recenterOn = useCallback(
    (id: string) => {
      const node = nodes.find((n) => n.id === id);
      if (!node || !zoomRef.current || !svgRef.current) return;
      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
      const k = 1.4;
      const tx = width / 2 - (node.x ?? 0) * k;
      const ty = CHART_HEIGHT / 2 - (node.y ?? 0) * k;
      svg
        .transition()
        .duration(700)
        .ease(d3.easeCubicInOut)
        .call(zoomRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
    },
    [nodes, width]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearchError(null);
      const parsed = parseRef(value);
      if (!parsed) {
        setSearchError("Use 'Book Chapter:Verse'");
        return;
      }
      const key = verseKey(parsed);
      const match = nodes.find((n) => n.id === key);
      if (!match) {
        setSearchError("Not in graph");
        return;
      }
      setHighlightId(key);
      setSelectedId(key);
      recenterOn(key);
    },
    [nodes, recenterOn]
  );

  const selectedNode = selectedId ? nodes.find((n) => n.id === selectedId) : null;
  const selectedRefs = selectedId ? refsByNode.get(selectedId) ?? [] : [];

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative border overflow-hidden"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface)",
          borderRadius: 4,
          height: CHART_HEIGHT,
        }}
      >
        <svg
          ref={svgRef}
          width={width}
          height={CHART_HEIGHT}
          style={{ display: "block", userSelect: "none", cursor: "grab" }}
        >
          <g ref={gRef}>
            <g ref={linksGRef} />
            <g ref={nodesGRef} />
          </g>
        </svg>

        {/* Filter panel (top-left) */}
        <div
          className="absolute border"
          style={{
            top: 12,
            left: 12,
            padding: 12,
            background: "var(--color-surface)",
            borderColor: "var(--color-border-strong)",
            borderRadius: 4,
            width: 220,
            zIndex: 10,
          }}
        >
          <p className="t-label mb-2" style={{ fontSize: 9 }}>
            Filter
          </p>

          {/* Testament pill */}
          <div
            className="flex border rounded overflow-hidden mb-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            {(["OT", "NT", "Both"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTestament(t)}
                className="flex-1 h-7 text-[10px] transition-colors"
                style={{
                  background: testament === t ? "var(--color-gold-light)" : "transparent",
                  color: testament === t ? "var(--color-gold)" : "var(--color-ink-muted)",
                  borderRight: t !== "Both" ? "1px solid var(--color-border)" : undefined,
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Min votes */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="t-label" style={{ fontSize: 9 }}>
                Min votes
              </span>
              <span className="text-[10px]" style={{ color: "var(--color-ink-muted)" }}>
                {minVotes}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={minVotes}
              onChange={(e) => setMinVotes(parseInt(e.target.value, 10))}
              style={{ width: "100%", accentColor: "var(--color-gold)", border: "none" }}
            />
          </div>

          {/* Book multi-select */}
          <div className="relative">
            <button
              onClick={() => setShowBookMenu((v) => !v)}
              className="w-full h-7 px-2 text-[10px] border rounded flex items-center justify-between"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-ink-muted)",
                background: "transparent",
              }}
            >
              <span>
                {bookFilter.size === 0
                  ? "All books"
                  : `${bookFilter.size} book${bookFilter.size !== 1 ? "s" : ""}`}
              </span>
              <span>{showBookMenu ? "▴" : "▾"}</span>
            </button>
            {showBookMenu && (
              <div
                className="absolute left-0 right-0 mt-1 border max-h-[240px] overflow-y-auto"
                style={{
                  background: "var(--color-surface)",
                  borderColor: "var(--color-border-strong)",
                  zIndex: 20,
                  borderRadius: 4,
                }}
              >
                {bookFilter.size > 0 && (
                  <button
                    onClick={() => setBookFilter(new Set())}
                    className="w-full text-left px-2 py-1 text-[10px] border-b"
                    style={{
                      color: "var(--color-gold)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    Clear all
                  </button>
                )}
                {availableBooks.map((book) => {
                  const active = bookFilter.has(book);
                  return (
                    <button
                      key={book}
                      onClick={() => {
                        const next = new Set(bookFilter);
                        if (active) next.delete(book);
                        else next.add(book);
                        setBookFilter(next);
                      }}
                      className="w-full text-left px-2 py-1 text-[10px]"
                      style={{
                        color: active ? "var(--color-gold)" : "var(--color-ink-muted)",
                        background: active ? "var(--color-gold-light)" : "transparent",
                      }}
                    >
                      {active ? "✓ " : "  "}
                      {book}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Search (top-right) */}
        <div
          className="absolute border"
          style={{
            top: 12,
            right: 12,
            padding: 10,
            background: "var(--color-surface)",
            borderColor: "var(--color-border-strong)",
            borderRadius: 4,
            width: 220,
            zIndex: 10,
          }}
        >
          <p className="t-label mb-1" style={{ fontSize: 9 }}>
            Find verse
          </p>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch(searchValue);
            }}
            placeholder="Romans 8:28"
            style={{ fontSize: 12, padding: "4px 2px" }}
          />
          {searchError ? (
            <p className="text-[10px] mt-1" style={{ color: "var(--color-gold)" }}>
              {searchError}
            </p>
          ) : highlightId ? (
            <button
              onClick={() => {
                setHighlightId(null);
                setSearchValue("");
              }}
              className="text-[10px] mt-1"
              style={{ color: "var(--color-ink-muted)" }}
            >
              Clear highlight
            </button>
          ) : (
            <p className="text-[10px] mt-1" style={{ color: "var(--color-ink-faint)" }}>
              Press enter to highlight
            </p>
          )}
        </div>

        {/* Pulse animation definition */}
        <style>{`
          @keyframes graph-pulse {
            0% { r: var(--r0); opacity: 0.9; }
            100% { r: calc(var(--r0) + 16); opacity: 0; }
          }
        `}</style>
      </div>

      {/* Legend */}
      <div
        className="flex items-center gap-4 mt-4 text-[11px]"
        style={{ color: "var(--color-ink-muted)" }}
      >
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block"
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "var(--color-gold)",
            }}
          />
          Old Testament
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block"
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "var(--color-navy)",
            }}
          />
          New Testament
        </span>
        <span className="t-label" style={{ fontSize: 10 }}>
          {nodes.length} verses · {links.length} edges
        </span>
      </div>

      {/* Side panel */}
      {selectedNode && (
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
            <p className="t-label">Verse</p>
            <button
              onClick={() => setSelectedId(null)}
              className="text-[18px] leading-none"
              style={{ color: "var(--color-ink-faint)" }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="px-5 py-5">
            <h2
              className="font-serif text-[22px] leading-tight"
              style={{ color: "var(--color-ink)" }}
            >
              {prettyRef(selectedNode.ref)}
            </h2>
            <div className="flex items-center gap-2 mt-2 mb-5">
              <span
                className={`badge ${
                  selectedNode.testament === "OT" ? "badge-gold" : "badge-navy"
                }`}
              >
                {selectedNode.testament === "OT" ? "Old Testament" : "New Testament"}
              </span>
              <span className="badge badge-muted" style={{ fontSize: 9 }}>
                {selectedNode.degree} link{selectedNode.degree !== 1 ? "s" : ""}
              </span>
            </div>

            <Link
              href={`/read/${encodeURIComponent(selectedNode.ref.book)}/${selectedNode.ref.chapter}`}
              className="font-serif text-[13px] inline-block mb-5"
              style={{ color: "var(--color-gold)" }}
            >
              Read {selectedNode.ref.book} {selectedNode.ref.chapter} →
            </Link>

            <p className="t-label mb-2" style={{ fontSize: 9 }}>
              Cross-references
            </p>
            <ul className="space-y-1">
              {selectedRefs.map(({ target, voteCount }) => (
                <li key={target.id}>
                  <button
                    onClick={() => {
                      setSelectedId(target.id);
                      setHighlightId(target.id);
                      recenterOn(target.id);
                    }}
                    className="w-full text-left py-1.5 px-2 flex items-center justify-between hover:bg-[var(--color-gold-light)] rounded-sm"
                  >
                    <span
                      className="font-serif text-[13px]"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {prettyRef(target.ref)}
                    </span>
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--color-ink-faint)" }}
                    >
                      {voteCount}
                    </span>
                  </button>
                </li>
              ))}
              {selectedRefs.length === 0 && (
                <li className="text-[12px]" style={{ color: "var(--color-ink-faint)" }}>
                  No cross-references recorded.
                </li>
              )}
            </ul>
          </div>
        </aside>
      )}
    </div>
  );
}
