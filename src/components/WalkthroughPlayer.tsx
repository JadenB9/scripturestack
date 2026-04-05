"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// Type-only — actual module is dynamically imported on the client.
import type { Map as MapboxMap, Marker as MapboxMarker } from "mapbox-gl";
import type { WalkthroughStop } from "@/lib/data/walkthrough";
import { ERA_COLORS, ERA_ORDER } from "@/lib/data/walkthrough";
import { LOCATIONS } from "@/lib/data/locations";

type Props = { stops: WalkthroughStop[] };

type LoadedStop = {
  stop: WalkthroughStop;
  verses: Array<{ verse: number; text: string }>;
};

const LOCATION_BY_ID = new Map(LOCATIONS.map((l) => [l.id, l] as const));

const PACE_OPTIONS: Array<{ label: string; ms: number }> = [
  { label: "Slow", ms: 14000 },
  { label: "Normal", ms: 9000 },
  { label: "Fast", ms: 5000 },
];

function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year).toLocaleString()} BC`;
  return `AD ${year}`;
}

export function WalkthroughPlayer({ stops }: Props) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<LoadedStop | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pace, setPace] = useState(PACE_OPTIONS[1].ms);
  const [eraFilter, setEraFilter] = useState<string>("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markerRef = useRef<MapboxMarker | null>(null);
  const mapboxLibRef = useRef<typeof import("mapbox-gl") | null>(null);
  const playTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const current = stops[index];

  // ── Map init (dynamically imports mapbox-gl client-side only) ──
  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current) return;

    let cancelled = false;
    let localMap: MapboxMap | null = null;
    let ro: ResizeObserver | null = null;

    (async () => {
      try {
        const mapboxModule = await import("mapbox-gl");
        await import("mapbox-gl/dist/mapbox-gl.css");
        if (cancelled || !containerRef.current) return;

        const mapboxgl = mapboxModule.default;
        mapboxLibRef.current = mapboxModule;
        mapboxgl.accessToken = token;

        localMap = new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: [33.5, 33],
          zoom: 4.5,
          attributionControl: false,
        });
        mapRef.current = localMap;

        ro = new ResizeObserver(() => localMap?.resize());
        ro.observe(containerRef.current);

        localMap.on("error", (e) => {
          // eslint-disable-next-line no-console
          console.warn("[walkthrough] mapbox error", e?.error);
        });

        localMap.on("load", () => {
          if (!localMap) return;
          try {
            const style = localMap.getStyle();
            for (const layer of style?.layers ?? []) {
              if (layer.type === "background") {
                localMap.setPaintProperty(layer.id, "background-color", "#F3EAD8");
              } else if (layer.type === "fill") {
                if (/water|ocean|sea|river|lake/i.test(layer.id)) {
                  localMap.setPaintProperty(layer.id, "fill-color", "#D9CDB3");
                } else if (/land|earth|landcover|landuse/i.test(layer.id)) {
                  localMap.setPaintProperty(layer.id, "fill-color", "#F3EAD8");
                }
              }
            }
          } catch {
            /* ignore tint failures */
          }
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[walkthrough] failed to init mapbox", err);
        if (!cancelled) setMapError(err instanceof Error ? err.message : String(err));
      }
    })();

    return () => {
      cancelled = true;
      if (ro) ro.disconnect();
      if (localMap) localMap.remove();
      mapRef.current = null;
    };
  }, [token]);

  // ── Fetch stop data when index changes ───────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/walkthrough/${current.id}`)
      .then((r) => r.json())
      .then((data: LoadedStop) => {
        if (!cancelled) {
          setLoaded(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [current.id]);

  // ── Animate the map + marker whenever the stop changes ──────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let target: [number, number] | null = null;
    if (current.locationId) {
      const loc = LOCATION_BY_ID.get(current.locationId);
      if (loc) target = [loc.lon, loc.lat];
    }
    if (!target && current.fallbackLonLat) target = current.fallbackLonLat;
    if (!target) return;

    const lib = mapboxLibRef.current;
    if (!lib) return;
    const mapboxgl = lib.default;

    // Replace the marker rather than accumulating them.
    if (markerRef.current) markerRef.current.remove();
    const el = document.createElement("div");
    el.setAttribute("aria-label", current.title);
    el.style.width = "18px";
    el.style.height = "18px";
    el.style.borderRadius = "9999px";
    el.style.background = ERA_COLORS[current.era] ?? "#92400E";
    el.style.border = "3px solid #FFFFFF";
    el.style.boxSizing = "content-box";
    el.style.boxShadow = "0 0 0 4px rgba(146, 64, 14, 0.25)";

    markerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat(target)
      .addTo(map);

    map.flyTo({
      center: target,
      zoom: 5.5,
      duration: 1400,
      essential: true,
    });
  }, [current]);

  // ── Auto-play ────────────────────────────────────────────────
  useEffect(() => {
    if (!playing) {
      if (playTimer.current) clearTimeout(playTimer.current);
      return;
    }
    playTimer.current = setTimeout(() => {
      setIndex((i) => (i + 1 >= stops.length ? i : i + 1));
    }, pace);
    return () => {
      if (playTimer.current) clearTimeout(playTimer.current);
    };
  }, [playing, index, pace, stops.length]);

  // ── Keyboard navigation ─────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "j" || e.key === " ") {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, stops.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "k") {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "p") {
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stops.length]);

  const goTo = useCallback((i: number) => {
    setIndex(Math.max(0, Math.min(i, stops.length - 1)));
  }, [stops.length]);

  const eras = useMemo(() => {
    // Era → first stop index, so clicking an era jumps the walkthrough.
    const map = new Map<string, number>();
    stops.forEach((s, i) => {
      if (!map.has(s.era)) map.set(s.era, i);
    });
    return ERA_ORDER.filter((e) => map.has(e)).map((e) => ({ era: e, first: map.get(e)! }));
  }, [stops]);

  const progress = ((index + 1) / stops.length) * 100;
  const currentLoc = current.locationId ? LOCATION_BY_ID.get(current.locationId) : null;

  const filteredIndices = useMemo(() => {
    if (!eraFilter) return stops.map((_, i) => i);
    return stops.reduce<number[]>((acc, s, i) => {
      if (s.era === eraFilter) acc.push(i);
      return acc;
    }, []);
  }, [stops, eraFilter]);

  return (
    <div className="h-full flex flex-col lg:flex-row" style={{ background: "var(--color-parchment)" }}>
      {/* LEFT — map + era rail */}
      <div className="relative flex-1 min-h-[360px] border-b lg:border-b-0 lg:border-r" style={{ borderColor: "var(--color-border)" }}>
        {mapError ? (
          <div className="h-full flex items-center justify-center">
            <div
              className="border p-6 max-w-md text-center"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", borderRadius: 8 }}
            >
              <div className="t-label mb-2">Map failed to load</div>
              <p className="text-[12px]" style={{ color: "var(--color-ink-muted)" }}>{mapError}</p>
            </div>
          </div>
        ) : !token ? (
          <div className="h-full flex items-center justify-center">
            <div
              className="border p-6 max-w-sm text-center"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
                borderRadius: 8,
              }}
            >
              <div className="t-label mb-2">Map disabled</div>
              <p className="text-[13px]" style={{ color: "var(--color-ink-muted)" }}>
                Set <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> in <code>.env.local</code> to enable the walkthrough map.
              </p>
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="absolute inset-0" />
        )}

        {/* Era jump rail overlay */}
        <div
          className="absolute top-4 left-4 border p-2 max-w-[calc(100%-32px)]"
          style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: 6 }}
        >
          <div className="t-label mb-1.5" style={{ fontSize: 9 }}>Eras</div>
          <div className="flex flex-wrap gap-1">
            {eras.map(({ era, first }) => (
              <button
                key={era}
                onClick={() => goTo(first)}
                className="pill"
                style={{
                  fontSize: 10,
                  padding: "3px 8px",
                  borderColor: current.era === era ? ERA_COLORS[era] : "var(--color-border)",
                  color: current.era === era ? ERA_COLORS[era] : "var(--color-ink-muted)",
                }}
              >
                {era}
              </button>
            ))}
          </div>
        </div>

        {/* Location caption */}
        {currentLoc && (
          <div
            className="absolute bottom-4 left-4 border p-3 max-w-[340px]"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)", borderRadius: 6 }}
          >
            <div className="font-serif text-[15px]" style={{ color: "var(--color-ink)" }}>
              {currentLoc.name}
            </div>
            {currentLoc.modernName && (
              <div className="text-[11px]" style={{ color: "var(--color-ink-faint)" }}>
                ({currentLoc.modernName})
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT — passage panel */}
      <aside
        className="w-full lg:w-[440px] flex flex-col overflow-hidden"
        style={{ background: "var(--color-surface)" }}
      >
        {/* Station header */}
        <div className="px-6 pt-5 pb-3 border-b" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: ERA_COLORS[current.era] }}
            />
            <span className="t-label" style={{ fontSize: 10 }}>
              {current.era} · {formatYear(current.year)}
            </span>
          </div>
          <h2 className="font-serif text-[24px] leading-tight" style={{ color: "var(--color-ink)" }}>
            {current.title}
          </h2>
          <p className="mt-2 text-[12px]" style={{ color: "var(--color-ink-muted)" }}>
            {current.summary}
          </p>
        </div>

        {/* Passage */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-2 flex items-baseline justify-between">
            <div className="t-label">{current.passage.book} {current.passage.chapter}</div>
            <Link
              href={`/read/${encodeURIComponent(current.passage.book)}/${current.passage.chapter}${
                current.passage.verseStart ? `#v${current.passage.verseStart}` : ""
              }`}
              className="text-[11px]"
              style={{ color: "var(--color-gold)" }}
            >
              Read in context →
            </Link>
          </div>

          {loading && !loaded ? (
            <div className="space-y-2">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-11/12" />
              <div className="skeleton h-4 w-4/5" />
            </div>
          ) : (
            <div>
              {loaded?.verses.map((v) => (
                <p key={v.verse} className="verse-text fade-in" style={{ fontSize: 16 }}>
                  <sup className="verse-number">{v.verse}</sup>
                  {v.text}{" "}
                </p>
              ))}
            </div>
          )}

          <blockquote
            className="mt-6 pl-4 py-1 border-l-2 font-serif text-[15px] italic"
            style={{ borderColor: ERA_COLORS[current.era], color: "var(--color-ink)" }}
          >
            “{current.highlight}”
          </blockquote>
        </div>

        {/* Transport controls */}
        <div className="border-t" style={{ borderColor: "var(--color-border)" }}>
          <div className="h-1 w-full" style={{ background: "var(--color-border)" }}>
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progress}%`, background: "var(--color-gold)" }}
            />
          </div>
          <div className="px-6 py-3 flex items-center gap-2">
            <button
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              className="btn"
              style={{ opacity: index === 0 ? 0.4 : 1 }}
              aria-label="Previous stop"
            >
              ←
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="btn btn-primary"
              aria-label={playing ? "Pause walkthrough" : "Play walkthrough"}
            >
              {playing ? "❚❚ Pause" : "▶ Play"}
            </button>
            <button
              onClick={() => goTo(index + 1)}
              disabled={index === stops.length - 1}
              className="btn"
              style={{ opacity: index === stops.length - 1 ? 0.4 : 1 }}
              aria-label="Next stop"
            >
              →
            </button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px]" style={{ color: "var(--color-ink-faint)" }}>Pace</span>
              <div className="segment">
                {PACE_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setPace(opt.ms)}
                    className={pace === opt.ms ? "is-active" : ""}
                    style={{ padding: "4px 10px", fontSize: 11 }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="px-6 pb-3 flex items-center gap-2 text-[11px]" style={{ color: "var(--color-ink-faint)" }}>
            <span>
              Stop {index + 1} of {stops.length}
            </span>
            <span className="mx-1">·</span>
            <span>← →</span>
            <span className="mx-1">·</span>
            <span>P to play</span>
          </div>
        </div>
      </aside>

      {/* BOTTOM — mini timeline strip, spans full width on mobile, below both columns on desktop */}
      <div
        className="fixed bottom-0 left-0 right-0 md:left-[240px] border-t backdrop-blur"
        style={{
          background: "var(--color-parchment-translucent)",
          borderColor: "var(--color-border)",
          zIndex: 10,
        }}
      >
        <div className="px-6 py-2 flex items-center gap-3">
          <select
            value={eraFilter}
            onChange={(e) => setEraFilter(e.target.value)}
            className="text-[11px]"
            style={{ maxWidth: 140, border: "none", padding: 0 }}
          >
            <option value="">Every era</option>
            {ERA_ORDER.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <div className="flex-1 flex items-center gap-0.5 overflow-x-auto">
            {stops.map((s, i) => {
              const included = filteredIndices.includes(i);
              if (!included) return null;
              const isCurrent = i === index;
              return (
                <button
                  key={s.id}
                  onClick={() => goTo(i)}
                  aria-label={s.title}
                  title={`${s.title} — ${formatYear(s.year)}`}
                  className="shrink-0"
                  style={{
                    width: isCurrent ? 10 : 6,
                    height: isCurrent ? 14 : 10,
                    borderRadius: 1,
                    background: ERA_COLORS[s.era],
                    opacity: isCurrent ? 1 : 0.55,
                    border: "none",
                    transition: "all 150ms ease-out",
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
