"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import {
  LOCATIONS,
  LOCATION_BY_ID,
  JOURNEYS,
  PERIOD_DATES,
  type Location,
  type Journey,
  type Period,
} from "@/lib/data/locations";
import { detectWebGL } from "@/lib/webgl-check";

type Props = {
  initialLocationIds?: string[];
  highlightJourneyId?: string;
};

const ALL_PERIODS: Array<Period | "All"> = [
  "All",
  "Patriarchal",
  "Exodus",
  "Conquest",
  "Monarchy",
  "Exile",
  "NT",
  "Return",
];

function formatDate(year: number): string {
  if (year < 0) return `${Math.abs(year)} BC`;
  return `AD ${year}`;
}

function buildGeoJSON(locs: Location[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: locs.map((loc) => ({
      type: "Feature" as const,
      properties: { id: loc.id, name: loc.name },
      geometry: { type: "Point" as const, coordinates: [loc.lon, loc.lat] },
    })),
  };
}

export function AtlasMap({ initialLocationIds, highlightJourneyId }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const [period, setPeriod] = useState<Period | "All">("All");
  const [selected, setSelected] = useState<Location | null>(null);
  const [activeJourney, setActiveJourney] = useState<Journey | null>(
    () => (highlightJourneyId ? JOURNEYS.find((j) => j.id === highlightJourneyId) ?? null : null),
  );
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [journeyPanelOpen, setJourneyPanelOpen] = useState(false);
  const [periodPanelOpen, setPeriodPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Search results filtered by query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return LOCATIONS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.modernName && l.modernName.toLowerCase().includes(q)),
    ).slice(0, 8);
  }, [searchQuery]);

  // Compute visible locations based on period or active journey.
  const visible = useMemo(() => {
    let list = LOCATIONS;
    if (initialLocationIds && initialLocationIds.length > 0) {
      const set = new Set(initialLocationIds);
      list = list.filter((l) => set.has(l.id));
    }
    if (activeJourney) {
      const journeyIds = new Set(activeJourney.routeLocationIds);
      list = list.filter((l) => journeyIds.has(l.id));
    } else if (period !== "All") {
      list = list.filter((l) => l.periods.includes(period));
    }
    return list;
  }, [initialLocationIds, period, activeJourney]);

  // Update GeoJSON source + route visibility whenever visible or activeJourney changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const src = map.getSource("locations") as mapboxgl.GeoJSONSource | undefined;
    if (src) src.setData(buildGeoJSON(visible));

    // Toggle journey route layers
    for (const j of JOURNEYS) {
      const layerId = `journey-route-${j.id}`;
      if (!map.getLayer(layerId)) continue;
      map.setLayoutProperty(
        layerId,
        "visibility",
        activeJourney?.id === j.id ? "visible" : "none",
      );
    }
  }, [visible, mapReady, activeJourney]);

  // Fly to fit journey bounds when a journey is selected.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !activeJourney) return;

    const coords = activeJourney.routeLocationIds
      .map((id) => LOCATION_BY_ID.get(id))
      .filter((l): l is Location => Boolean(l))
      .map((l) => [l.lon, l.lat] as [number, number]);

    if (coords.length < 2) return;

    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    const sw: [number, number] = [Math.min(...lngs), Math.min(...lats)];
    const ne: [number, number] = [Math.max(...lngs), Math.max(...lats)];

    map.fitBounds([sw, ne], { padding: 80, duration: 1200 });
  }, [activeJourney, mapReady]);

  const selectJourney = useCallback((j: Journey | null) => {
    setActiveJourney(j);
    setSelected(null);
    setJourneyPanelOpen(false);
    setPeriodPanelOpen(false);
    if (j) setPeriod("All");
  }, []);

  const selectFromSearch = useCallback((loc: Location) => {
    setSelected(loc);
    setSearchQuery("");
    const map = mapRef.current;
    if (map) map.flyTo({ center: [loc.lon, loc.lat], zoom: 8, duration: 1000 });
  }, []);

  // Lazily load mapbox-gl and initialize the map.
  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current) return;

    const webglSupport = detectWebGL();
    // eslint-disable-next-line no-console
    console.info("[atlas] webgl probe:", webglSupport);

    let cancelled = false;
    let map: MapboxMap | null = null;
    let resizeHandle: ReturnType<typeof setTimeout> | null = null;
    let ro: ResizeObserver | null = null;

    (async () => {
      try {
        const mapboxModule = await import("mapbox-gl");
        await import("mapbox-gl/dist/mapbox-gl.css");
        if (cancelled || !containerRef.current) return;

        const mapboxgl = mapboxModule.default;
        mapboxgl.accessToken = token;

        map = new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: [35.2, 31.7],
          zoom: 4,
          attributionControl: false,
          failIfMajorPerformanceCaveat: false,
          transformRequest: (url) => {
            if (url.startsWith("https://events.mapbox.com/")) {
              return { url: "data:," };
            }
            return { url };
          },
        });

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
        resizeHandle = setTimeout(() => map?.resize(), 150);

        const styleTimeout = setTimeout(() => {
          if (!cancelled && !map?.isStyleLoaded()) {
            setLoadError("Mapbox style did not load within 10 seconds.");
          }
        }, 10000);

        let firstError: string | null = null;
        map.on("error", (e) => {
          const message = e?.error?.message || String(e?.error || "unknown mapbox error");
          // eslint-disable-next-line no-console
          console.warn("[atlas] mapbox error:", message);
          if (!firstError) {
            firstError = message;
            if (!cancelled) setLoadError(message);
          }
        });

        map.once("styledata", () => {
          clearTimeout(styleTimeout);
        });

        map.on("load", () => {
          if (!map) return;

          // Parchment tinting
          try {
            const layers = map.getStyle()?.layers ?? [];
            for (const layer of layers) {
              if (layer.type === "background") {
                map.setPaintProperty(layer.id, "background-color", "#F3EAD8");
              } else if (layer.type === "fill") {
                if (/water|ocean|sea|river|lake/i.test(layer.id)) {
                  map.setPaintProperty(layer.id, "fill-color", "#D9CDB3");
                } else if (/land|earth|landcover|landuse/i.test(layer.id)) {
                  map.setPaintProperty(layer.id, "fill-color", "#F3EAD8");
                }
              }
            }
          } catch { /* ignore */ }

          // Journey route layers (all hidden by default)
          for (const j of JOURNEYS) {
            const coords = j.routeLocationIds
              .map((id) => LOCATION_BY_ID.get(id))
              .filter((l): l is Location => Boolean(l))
              .map((l) => [l.lon, l.lat] as [number, number]);
            if (coords.length < 2) continue;

            map.addSource(`journey-route-${j.id}`, {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: { type: "LineString", coordinates: coords },
              },
            });
            map.addLayer({
              id: `journey-route-${j.id}`,
              type: "line",
              source: `journey-route-${j.id}`,
              layout: { "line-cap": "round", "line-join": "round", visibility: "none" },
              paint: {
                "line-color": j.color,
                "line-width": 3,
                "line-dasharray": [3, 2],
                "line-opacity": 0.9,
              },
            });
          }

          // Canvas-based location markers via GeoJSON source + layers.
          // These are rendered as part of the WebGL canvas, so they stay
          // pixel-locked to their geographic coordinates during pan/zoom
          // instead of floating like DOM markers.
          map.addSource("locations", {
            type: "geojson",
            data: buildGeoJSON(LOCATIONS),
          });

          // Circle layer — the dots
          map.addLayer({
            id: "locations-circles",
            type: "circle",
            source: "locations",
            paint: {
              "circle-radius": 6,
              "circle-color": "#92400E",
              "circle-stroke-width": 1.5,
              "circle-stroke-color": "#FFFFFF",
            },
          });

          // Symbol layer — ancient name labels
          map.addLayer({
            id: "locations-labels",
            type: "symbol",
            source: "locations",
            layout: {
              "text-field": ["get", "name"],
              "text-size": 11,
              "text-offset": [0, 1.4],
              "text-anchor": "top",
              "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
              "text-allow-overlap": false,
              "text-optional": true,
            },
            paint: {
              "text-color": "#44403C",
              "text-halo-color": "#F3EAD8",
              "text-halo-width": 1.5,
            },
          });

          // Click handler for circle markers
          map.on("click", "locations-circles", (e) => {
            if (!e.features?.length) return;
            const id = e.features[0].properties?.id;
            const loc = LOCATION_BY_ID.get(id);
            if (loc) setSelected(loc);
          });

          // Cursor style on hover
          map.on("mouseenter", "locations-circles", () => {
            if (map) map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "locations-circles", () => {
            if (map) map.getCanvas().style.cursor = "";
          });

          if (!cancelled) setMapReady(true);
        });

        mapRef.current = map;

        ro = new ResizeObserver(() => map?.resize());
        if (containerRef.current) ro.observe(containerRef.current);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[atlas] failed to init mapbox", err);
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : String(err));
        }
      }
    })();

    return () => {
      cancelled = true;
      if (resizeHandle) clearTimeout(resizeHandle);
      if (ro) ro.disconnect();
      if (map) map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [token]);

  if (!token) {
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        style={{ background: "var(--color-parchment)" }}
      >
        <div
          className="border p-6 max-w-sm text-center"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", borderRadius: 8 }}
        >
          <div className="t-label mb-2">Map disabled</div>
          <p className="text-[13px]" style={{ color: "var(--color-ink-muted)" }}>
            Set <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> in <code>.env.local</code> to enable the Atlas.
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    const isWebGLError = /webgl/i.test(loadError);
    return (
      <div className="h-full w-full flex items-center justify-center px-6" style={{ background: "var(--color-parchment)" }}>
        <div className="border p-6 max-w-[500px] text-left" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", borderRadius: 8 }}>
          <div className="t-label mb-3">{isWebGLError ? "WebGL could not start" : "Map failed to load"}</div>
          <p className="text-[14px] mb-3" style={{ color: "var(--color-ink)" }}>{loadError}</p>
          {isWebGLError ? (
            <div className="text-[12px] leading-[1.7] space-y-3" style={{ color: "var(--color-ink-muted)" }}>
              <p>The Atlas renders through WebGL. A few things to try:</p>
              <div>
                <strong className="block mb-1" style={{ color: "var(--color-ink)" }}>Hardware acceleration</strong>
                Open <code>brave://settings/system</code> (or <code>chrome://settings/system</code>) and ensure
                &quot;Use graphics acceleration when available&quot; is ON.
              </div>
              <div>
                <strong className="block mb-1" style={{ color: "var(--color-ink)" }}>Try another browser</strong>
                Safari, Firefox, or Chrome will tell us if it&apos;s browser-specific.
              </div>
            </div>
          ) : (
            <p className="text-[11px]" style={{ color: "var(--color-ink-faint)" }}>
              Check your Mapbox token and network connection, then reload.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#F3EAD8" }}>
      {/* ── Toolbar: era dropdown + journey dropdown + search ── */}
      <div
        className="shrink-0 flex items-center gap-2 px-4 py-2 border-b z-10"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        {/* Era/period dropdown */}
        <div className="relative">
          <button
            onClick={() => { setPeriodPanelOpen(!periodPanelOpen); setJourneyPanelOpen(false); }}
            className={`pill ${!activeJourney && period !== "All" ? "is-active" : ""}`}
            style={{ fontSize: 11, padding: "4px 10px" }}
          >
            {period !== "All" ? `${period} · ${PERIOD_DATES[period].label}` : "Era"}
            <span style={{ marginLeft: 4, fontSize: 9 }}>▾</span>
          </button>

          {periodPanelOpen && (
            <div
              className="absolute top-full left-0 mt-1 border shadow-lg"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
                borderRadius: 8,
                width: 360,
                maxHeight: 480,
                overflowY: "auto",
                zIndex: 50,
              }}
            >
              {ALL_PERIODS.map((p) => {
                const active = !activeJourney && period === p;
                const info = p !== "All" ? PERIOD_DATES[p] : null;
                return (
                  <button
                    key={p}
                    onClick={() => { setPeriod(p); selectJourney(null); setPeriodPanelOpen(false); }}
                    className="w-full text-left px-3 py-2.5 border-b last:border-b-0"
                    style={{
                      borderColor: "var(--color-border)",
                      background: active ? "var(--color-parchment)" : "transparent",
                    }}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-[12px] font-medium" style={{ color: "var(--color-ink)" }}>
                        {p === "All" ? "All Eras" : p}
                      </span>
                      {info && (
                        <span className="text-[10px]" style={{ color: "var(--color-ink-faint)" }}>
                          {info.label}
                        </span>
                      )}
                    </div>
                    {info && (
                      <>
                        <div className="text-[10px] mt-0.5" style={{ color: "var(--color-gold)" }}>
                          {info.books}
                        </div>
                        <div className="text-[10px] mt-0.5 leading-[1.4]" style={{ color: "var(--color-ink-muted)" }}>
                          {info.description}
                        </div>
                      </>
                    )}
                    {p === "All" && (
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--color-ink-muted)" }}>
                        Show all locations across every era
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Journey dropdown */}
        <div className="relative">
          <button
            onClick={() => { setJourneyPanelOpen(!journeyPanelOpen); setPeriodPanelOpen(false); }}
            className={`pill ${activeJourney ? "is-active" : ""}`}
            style={{ fontSize: 11, padding: "4px 10px" }}
          >
            {activeJourney ? activeJourney.name : "Journeys"}
            <span style={{ marginLeft: 4, fontSize: 9 }}>▾</span>
          </button>

          {journeyPanelOpen && (
            <div
              className="absolute top-full left-0 mt-1 border shadow-lg"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
                borderRadius: 8,
                width: 320,
                maxHeight: 420,
                overflowY: "auto",
                zIndex: 50,
              }}
            >
              {activeJourney && (
                <button
                  onClick={() => selectJourney(null)}
                  className="w-full text-left px-3 py-2 border-b text-[11px]"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-ink-muted)" }}
                >
                  Clear journey — show all locations
                </button>
              )}
              {JOURNEYS.map((j) => {
                const on = activeJourney?.id === j.id;
                return (
                  <button
                    key={j.id}
                    onClick={() => selectJourney(on ? null : j)}
                    className="w-full text-left px-3 py-2.5 border-b last:border-b-0"
                    style={{
                      borderColor: "var(--color-border)",
                      background: on ? "var(--color-parchment)" : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          display: "inline-block",
                          width: 18,
                          height: 0,
                          borderTop: `2.5px dashed ${j.color}`,
                          flexShrink: 0,
                        }}
                      />
                      <span className="text-[12px] font-medium" style={{ color: "var(--color-ink)" }}>
                        {j.name}
                      </span>
                    </div>
                    <div className="text-[10px] mt-0.5 ml-[26px]" style={{ color: "var(--color-ink-faint)" }}>
                      {j.dateLabel}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ width: 1, height: 20, background: "var(--color-border)" }} />

        {/* Location search */}
        <div className="relative flex-1 max-w-[260px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search locations..."
            className="w-full text-[12px] px-3 py-1.5 border rounded-md outline-none"
            style={{
              background: "var(--color-parchment)",
              borderColor: "var(--color-border)",
              color: "var(--color-ink)",
            }}
            onFocus={() => { setPeriodPanelOpen(false); setJourneyPanelOpen(false); }}
          />
          {searchResults.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-1 border shadow-lg"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
                borderRadius: 8,
                zIndex: 50,
              }}
            >
              {searchResults.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => selectFromSearch(loc)}
                  className="w-full text-left px-3 py-2 border-b last:border-b-0"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div className="text-[12px] font-medium" style={{ color: "var(--color-ink)" }}>
                    {loc.name}
                  </div>
                  {loc.modernName && (
                    <div className="text-[10px]" style={{ color: "var(--color-ink-faint)" }}>
                      {loc.modernName}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Map ── */}
      <div className="flex-1 relative min-h-0">
        {/* h-full/w-full: mapbox-gl overrides position to relative on the
            container, so absolute+inset collapses to 0 height. */}
        <div ref={containerRef} className="h-full w-full" />

        {/* Selected location side panel */}
        {selected && (
          <aside
            className="absolute top-4 left-4 w-[320px] border panel-slide"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
              borderRadius: 8,
              maxHeight: "calc(100% - 32px)",
              overflowY: "auto",
              zIndex: 20,
            }}
          >
            <header
              className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div>
                <div className="font-serif text-[20px] leading-tight" style={{ color: "var(--color-ink)" }}>
                  {selected.name}
                </div>
                {selected.modernName && (
                  <div className="text-[12px] mt-0.5" style={{ color: "var(--color-ink-faint)" }}>
                    {selected.modernName}
                  </div>
                )}
                <div className="text-[11px] mt-1" style={{ color: "var(--color-ink-muted)" }}>
                  {formatDate(selected.dateRange.from)} — {formatDate(selected.dateRange.to)}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="text-[18px] leading-none"
                style={{ color: "var(--color-ink-muted)" }}
              >
                ×
              </button>
            </header>
            <div className="px-4 py-3">
              <div className="flex flex-wrap gap-1 mb-3">
                {selected.periods.map((p) => (
                  <span key={p} className="badge badge-gold">{p}</span>
                ))}
              </div>
              <p className="text-[13px] leading-[1.65] mb-4" style={{ color: "var(--color-ink)" }}>
                {selected.description}
              </p>
              <div className="t-label mb-2">Passages</div>
              <ul className="space-y-1">
                {selected.passages.map((p, i) => (
                  <li key={i}>
                    <Link
                      href={`/read/${encodeURIComponent(p.book)}/${p.chapter}${p.verse ? `#v${p.verse}` : ""}`}
                      className="font-serif text-[14px]"
                      style={{ color: "var(--color-gold)" }}
                    >
                      {p.book} {p.chapter}{p.verse ? `:${p.verse}` : ""}
                      <span style={{ marginLeft: 6 }}>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}

        {/* Journey info panel — shows when a journey is active and no location is selected */}
        {activeJourney && !selected && (
          <aside
            className="absolute top-4 left-4 w-[320px] border panel-slide"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
              borderRadius: 8,
              maxHeight: "calc(100% - 32px)",
              overflowY: "auto",
              zIndex: 20,
            }}
          >
            <header
              className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div>
                <div className="font-serif text-[20px] leading-tight" style={{ color: "var(--color-ink)" }}>
                  {activeJourney.name}
                </div>
                <div className="text-[11px] mt-1" style={{ color: "var(--color-ink-muted)" }}>
                  {activeJourney.dateLabel}
                </div>
              </div>
              <button
                onClick={() => selectJourney(null)}
                aria-label="Close"
                className="text-[18px] leading-none"
                style={{ color: "var(--color-ink-muted)" }}
              >
                ×
              </button>
            </header>
            <div className="px-4 py-3">
              <p className="text-[13px] leading-[1.65] mb-4" style={{ color: "var(--color-ink)" }}>
                {activeJourney.description}
              </p>

              {/* Route stops */}
              <div className="t-label mb-2">Stops</div>
              <div className="flex flex-col gap-1 mb-4">
                {activeJourney.routeLocationIds
                  .filter((id, idx, arr) => arr.indexOf(id) === idx) // dedupe for display
                  .map((id) => {
                    const loc = LOCATION_BY_ID.get(id);
                    if (!loc) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => setSelected(loc)}
                        className="text-left text-[12px] py-0.5 flex items-center gap-2"
                        style={{ color: "var(--color-ink)" }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: activeJourney.color,
                            flexShrink: 0,
                          }}
                        />
                        {loc.name}
                        {loc.modernName && (
                          <span style={{ color: "var(--color-ink-faint)", fontSize: 10 }}>
                            ({loc.modernName.split(",")[0]})
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>

              <div className="t-label mb-2">Key Passages</div>
              <ul className="space-y-2">
                {activeJourney.keyPassages.map((p, i) => (
                  <li key={i}>
                    <div className="font-serif text-[13px]" style={{ color: "var(--color-gold)" }}>
                      {p.ref}
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--color-ink-muted)" }}>
                      {p.label}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
