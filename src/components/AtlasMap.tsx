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
import { TIMELINE_EVENTS, type TimelineEvent } from "@/lib/data/timeline";
import { detectWebGL } from "@/lib/webgl-check";
import { MAP_PALETTE, MAP_STYLES, swapStyle, tintBaseStyle } from "@/lib/map-theme";
import { useTheme } from "./ThemeProvider";

type Props = {
  initialLocationIds?: string[];
  highlightJourneyId?: string;
};

// Muted blue-green water, distinct from the parchment land
const WATER = { light: "#B8CDD6", dark: "#121B24" } as const;

// What the Layers menu switches on and off. Saved per device.
type LayerToggles = { labels: boolean; modernNames: boolean; borders: boolean };
const LAYERS_KEY = "ss-atlas-layers";
const DEFAULT_LAYERS: LayerToggles = { labels: true, modernNames: true, borders: true };

function readLayerToggles(): LayerToggles {
  try {
    const raw = localStorage.getItem(LAYERS_KEY);
    if (!raw) return DEFAULT_LAYERS;
    const parsed = JSON.parse(raw) as Partial<LayerToggles>;
    return {
      labels: parsed.labels !== false,
      modernNames: parsed.modernNames !== false,
      borders: parsed.borders !== false,
    };
  } catch {
    return DEFAULT_LAYERS;
  }
}

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

// Color per primary period — gives visual distinction on the map
const PERIOD_COLORS: Record<Period, string> = {
  Patriarchal: "#92400E", // brown
  Exodus:      "#B45309", // amber
  Conquest:    "#7F1D1D", // red
  Monarchy:    "#1E3A5F", // navy
  Exile:       "#6B21A8", // purple
  NT:          "#0F766E", // teal
  Return:      "#4D7C0F", // olive
};

function buildGeoJSON(locs: Location[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: locs.map((loc) => ({
      type: "Feature" as const,
      properties: {
        id: loc.id,
        name: loc.name,
        period: loc.periods[0], // primary period for coloring
      },
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
  const [timelinePanelOpen, setTimelinePanelOpen] = useState(false);
  const [layersPanelOpen, setLayersPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [layers, setLayers] = useState<LayerToggles>(DEFAULT_LAYERS);
  // Bumped every time the base style (re)loads so the data effects re-apply.
  const [styleVersion, setStyleVersion] = useState(0);

  const { theme } = useTheme();
  // Map callbacks run outside React's render, so they read these refs.
  const themeRef = useRef(theme);
  const layersRef = useRef(layers);
  const styleThemeRef = useRef<typeof theme | null>(null);
  themeRef.current = theme;
  layersRef.current = layers;

  useEffect(() => {
    setLayers(readLayerToggles());
  }, []);

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

  // Update GeoJSON source + route visibility whenever visible or activeJourney
  // changes, and again after a style swap wipes the overlays.
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
  }, [visible, mapReady, activeJourney, styleVersion]);

  // Layer toggles: our labels are one layer; modern names and borders live
  // in the base style, so those go back through the tint pass.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !map.isStyleLoaded()) return;
    if (map.getLayer("locations-labels")) {
      map.setLayoutProperty("locations-labels", "visibility", layers.labels ? "visible" : "none");
    }
    tintBaseStyle(map, {
      theme: themeRef.current,
      water: WATER[themeRef.current],
      modernNames: layers.modernNames,
      borders: layers.borders,
    });
  }, [layers, mapReady, styleVersion]);

  // Theme flip: swap the base style. style.load below rebuilds the overlays.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (styleThemeRef.current === theme) return;
    styleThemeRef.current = theme;
    swapStyle(map, theme);
  }, [theme, mapReady]);

  const updateLayers = useCallback((patch: Partial<LayerToggles>) => {
    setLayers((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(LAYERS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

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

  const closeAllPanels = useCallback(() => {
    setJourneyPanelOpen(false);
    setPeriodPanelOpen(false);
    setTimelinePanelOpen(false);
    setLayersPanelOpen(false);
  }, []);

  const selectJourney = useCallback((j: Journey | null) => {
    setActiveJourney(j);
    setSelected(null);
    closeAllPanels();
    if (j) setPeriod("All");
  }, [closeAllPanels]);

  const selectFromSearch = useCallback((loc: Location) => {
    setSelected(loc);
    setSearchQuery("");
    const map = mapRef.current;
    if (map) map.flyTo({ center: [loc.lon, loc.lat], zoom: 8, duration: 1000 });
  }, []);

  // Timeline events with atlas locations — fly to the place when selected
  const timelineWithLocations = useMemo(
    () => TIMELINE_EVENTS.filter((e): e is TimelineEvent & { locationId: string } => Boolean(e.locationId)),
    [],
  );

  const selectTimelineEvent = useCallback((evt: TimelineEvent & { locationId: string }) => {
    const loc = LOCATION_BY_ID.get(evt.locationId);
    if (!loc) return;
    setSelected(loc);
    closeAllPanels();
    selectJourney(null);
    const map = mapRef.current;
    if (map) map.flyTo({ center: [loc.lon, loc.lat], zoom: 7, duration: 1000 });
  }, [closeAllPanels, selectJourney]);

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

        styleThemeRef.current = themeRef.current;
        map = new mapboxgl.Map({
          container: containerRef.current,
          style: MAP_STYLES[themeRef.current],
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
        let didLoad = false;
        map.on("error", (e) => {
          const message = e?.error?.message || String(e?.error || "unknown mapbox error");
          // eslint-disable-next-line no-console
          console.warn("[atlas] mapbox error:", message);
          // A single tile failing after the map is up shouldn't replace the
          // whole map with an error card — only fail if it never loaded.
          if (didLoad) return;
          if (!firstError) {
            firstError = message;
            // Tile errors include the full request URL (token and all); the
            // console has it, the page doesn't need it.
            if (!cancelled) setLoadError(message.replace(/https?:\/\/\S+/g, "").trim() || "Map tiles could not be loaded.");
          }
        });

        map.once("styledata", () => {
          clearTimeout(styleTimeout);
        });

        // Everything we draw on top of the base style. Runs on the first
        // style load and again after setStyle() swaps light/dark, which
        // throws away every source and layer we added.
        const addOverlays = () => {
          if (!map) return;
          const palette = MAP_PALETTE[themeRef.current];
          const toggles = layersRef.current;

          tintBaseStyle(map, {
            theme: themeRef.current,
            water: WATER[themeRef.current],
            modernNames: toggles.modernNames,
            borders: toggles.borders,
          });

          // Journey route layers (all hidden by default)
          for (const j of JOURNEYS) {
            if (map.getSource(`journey-route-${j.id}`)) continue;
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
          if (map.getSource("locations")) return;
          map.addSource("locations", {
            type: "geojson",
            data: buildGeoJSON(LOCATIONS),
          });

          // Circle layer — color-coded by primary biblical period
          map.addLayer({
            id: "locations-circles",
            type: "circle",
            source: "locations",
            paint: {
              "circle-radius": 6,
              "circle-color": [
                "match", ["get", "period"],
                "Patriarchal", PERIOD_COLORS.Patriarchal,
                "Exodus",      PERIOD_COLORS.Exodus,
                "Conquest",    PERIOD_COLORS.Conquest,
                "Monarchy",    PERIOD_COLORS.Monarchy,
                "Exile",       PERIOD_COLORS.Exile,
                "NT",          PERIOD_COLORS.NT,
                "Return",      PERIOD_COLORS.Return,
                "#92400E", // fallback
              ],
              "circle-stroke-width": 1.5,
              "circle-stroke-color": palette.markerStroke,
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
              visibility: toggles.labels ? "visible" : "none",
            },
            paint: {
              "text-color": palette.label,
              "text-halo-color": palette.halo,
              "text-halo-width": 1.5,
            },
          });
        };

        map.on("style.load", () => {
          addOverlays();
          if (!cancelled) setStyleVersion((v) => v + 1);
        });

        map.on("load", () => {
          didLoad = true;
          if (!map) return;

          // Click handler for circle markers. Layer event handlers survive a
          // setStyle() because they're keyed by layer id, so bind them once.
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
        <div className="border p-6 w-full max-w-[500px] text-left break-words" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", borderRadius: 8 }}>
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
    <div className="absolute inset-0 flex flex-col" style={{ background: MAP_PALETTE[theme].land }}>
      {/* ── Toolbar: era dropdown + journey dropdown + search ── */}
      <div
        className="shrink-0 flex items-center gap-2 px-4 py-2 border-b z-10"
        style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        {/* Era/period dropdown */}
        <div className="relative">
          <button
            onClick={() => { const next = !periodPanelOpen; closeAllPanels(); setPeriodPanelOpen(next); }}
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
            onClick={() => { const next = !journeyPanelOpen; closeAllPanels(); setJourneyPanelOpen(next); }}
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

        {/* Timeline events dropdown */}
        <div className="relative">
          <button
            onClick={() => { const next = !timelinePanelOpen; closeAllPanels(); setTimelinePanelOpen(next); }}
            className="pill"
            style={{ fontSize: 11, padding: "4px 10px" }}
          >
            Timeline
            <span style={{ marginLeft: 4, fontSize: 9 }}>▾</span>
          </button>

          {timelinePanelOpen && (
            <div
              className="absolute top-full left-0 mt-1 border shadow-lg"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
                borderRadius: 8,
                width: 380,
                maxHeight: 480,
                overflowY: "auto",
                zIndex: 50,
              }}
            >
              <div className="px-3 py-2 border-b text-[10px]" style={{ borderColor: "var(--color-border)", color: "var(--color-ink-muted)" }}>
                Events tied to locations — click to fly there
              </div>
              {timelineWithLocations.map((evt) => {
                const loc = LOCATION_BY_ID.get(evt.locationId);
                const yearStr = evt.year < 0 ? `${Math.abs(evt.year)} BC` : `AD ${evt.year}`;
                return (
                  <button
                    key={evt.id}
                    onClick={() => selectTimelineEvent(evt)}
                    className="w-full text-left px-3 py-2 border-b last:border-b-0"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-[10px] shrink-0 font-mono"
                        style={{
                          color: evt.importance === 3 ? "var(--color-gold)" : "var(--color-ink-faint)",
                          minWidth: 52,
                        }}
                      >
                        {yearStr}
                      </span>
                      <span className="text-[12px] font-medium" style={{ color: "var(--color-ink)" }}>
                        {evt.name}
                      </span>
                    </div>
                    <div className="text-[10px] mt-0.5 ml-[60px] leading-[1.4]" style={{ color: "var(--color-ink-muted)" }}>
                      {evt.description.slice(0, 100)}{evt.description.length > 100 ? "…" : ""}
                      {loc && (
                        <span style={{ color: "var(--color-ink-faint)", marginLeft: 4 }}>
                          — {loc.name}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Layers dropdown */}
        <div className="relative">
          <button
            onClick={() => { const next = !layersPanelOpen; closeAllPanels(); setLayersPanelOpen(next); }}
            className={`pill ${!layers.labels || !layers.modernNames || !layers.borders ? "is-active" : ""}`}
            style={{ fontSize: 11, padding: "4px 10px" }}
            aria-expanded={layersPanelOpen}
          >
            Layers
            <span style={{ marginLeft: 4, fontSize: 9 }}>▾</span>
          </button>

          {layersPanelOpen && (
            <div
              className="absolute top-full left-0 mt-1 border shadow-lg"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
                borderRadius: 8,
                width: 240,
                zIndex: 50,
              }}
            >
              {(
                [
                  ["labels", "Place names", "Our labels for the biblical sites"],
                  ["modernNames", "Modern names", "The base map's cities and roads"],
                  ["borders", "Modern borders", "Today's country lines, faded"],
                ] as Array<[keyof LayerToggles, string, string]>
              ).map(([key, label, hint]) => (
                <label
                  key={key}
                  className="flex items-start gap-3 px-3 py-2.5 border-b last:border-b-0 cursor-pointer"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <input
                    type="checkbox"
                    checked={layers[key]}
                    onChange={(e) => updateLayers({ [key]: e.target.checked })}
                    className="mt-0.5 accent-[var(--color-gold)]"
                  />
                  <span>
                    <span className="block text-[12px] font-medium" style={{ color: "var(--color-ink)" }}>
                      {label}
                    </span>
                    <span className="block text-[10px] mt-0.5" style={{ color: "var(--color-ink-faint)" }}>
                      {hint}
                    </span>
                  </span>
                </label>
              ))}
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
            onFocus={() => closeAllPanels()}
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
