"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { LOCATIONS, ROUTES, type Location, type Period } from "@/lib/data/locations";

type Props = {
  initialLocationIds?: string[];
  highlightRouteId?: string;
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

export function AtlasMap({ initialLocationIds, highlightRouteId }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [period, setPeriod] = useState<Period | "All">("All");
  const [selected, setSelected] = useState<Location | null>(null);
  const [activeRoutes, setActiveRoutes] = useState<Set<string>>(
    () => new Set(highlightRouteId ? [highlightRouteId] : []),
  );
  const [mapReady, setMapReady] = useState(false);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const visible = useMemo(() => {
    let list = LOCATIONS;
    if (initialLocationIds && initialLocationIds.length > 0) {
      const set = new Set(initialLocationIds);
      list = list.filter((l) => set.has(l.id));
    }
    if (period !== "All") {
      list = list.filter((l) => l.periods.includes(period));
    }
    return list;
  }, [initialLocationIds, period]);

  // Initialize the map once.
  useEffect(() => {
    if (!token) return;
    if (!containerRef.current) return;
    if (mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [35.2, 31.7],
      zoom: 4,
      attributionControl: false,
      projection: "mercator",
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    // Nudge the map to pick up its container size once the layout settles.
    const resizeHandle = setTimeout(() => map.resize(), 150);

    map.on("load", () => {
      // Tint every fill/background layer in the style towards a warm
      // parchment palette so the atlas feels like an old map instead of
      // a modern web map. We walk the layers rather than hard-coding
      // layer ids because style internals change between versions.
      try {
        const style = map.getStyle();
        const layers = style?.layers ?? [];
        for (const layer of layers) {
          const id = layer.id;
          if (layer.type === "background") {
            map.setPaintProperty(id, "background-color", "#F3EAD8");
          } else if (layer.type === "fill") {
            // Water layers: cooler tint so coastlines are readable.
            if (/water|ocean|sea|river|lake/i.test(id)) {
              map.setPaintProperty(id, "fill-color", "#D9CDB3");
            } else if (/land|earth|landcover|landuse/i.test(id)) {
              map.setPaintProperty(id, "fill-color", "#F3EAD8");
            }
          }
        }
      } catch {
        /* Style might not expose layer list — ignore and use default. */
      }

      // Prepare GeoJSON sources for each defined route.
      for (const route of ROUTES) {
        const coords = route.locationIds
          .map((id) => LOCATIONS.find((l) => l.id === id))
          .filter((l): l is Location => Boolean(l))
          .map((l) => [l.lon, l.lat] as [number, number]);
        const sourceId = `route-${route.id}`;
        const layerId = `route-layer-${route.id}`;

        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: coords },
          },
        });
        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-cap": "round",
            "line-join": "round",
            visibility: "none",
          },
          paint: {
            "line-color": route.color,
            "line-width": 2,
            "line-dasharray": [2, 2],
            "line-opacity": 0.85,
          },
        });
      }

      setMapReady(true);
    });

    mapRef.current = map;

    // Keep the canvas in sync if the window or the flex layout resizes.
    const ro = new ResizeObserver(() => {
      map.resize();
    });
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      clearTimeout(resizeHandle);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [token]);

  // Render markers whenever visible set changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    // Clear existing markers.
    for (const m of markersRef.current) m.remove();
    markersRef.current = [];

    for (const loc of visible) {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", loc.name);
      el.style.width = "12px";
      el.style.height = "12px";
      el.style.borderRadius = "9999px";
      el.style.background = "#92400E";
      el.style.border = "1.5px solid #FFFFFF";
      el.style.boxSizing = "content-box";
      el.style.cursor = "pointer";
      el.style.transition = "transform 120ms ease-out";
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.35)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
      });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelected(loc);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([loc.lon, loc.lat])
        .addTo(map);
      markersRef.current.push(marker);
    }

    return () => {
      for (const m of markersRef.current) m.remove();
      markersRef.current = [];
    };
  }, [visible, mapReady]);

  // Toggle route layer visibility.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    for (const route of ROUTES) {
      const layerId = `route-layer-${route.id}`;
      if (!map.getLayer(layerId)) continue;
      map.setLayoutProperty(
        layerId,
        "visibility",
        activeRoutes.has(route.id) ? "visible" : "none",
      );
    }
  }, [activeRoutes, mapReady]);

  if (!token) {
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        style={{ background: "var(--color-parchment)" }}
      >
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
            Set <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> in <code>.env.local</code> to enable the Atlas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Period filter — top-left pill bar */}
      <div
        className="absolute top-4 left-4 flex flex-wrap gap-1 p-2 border"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
          borderRadius: 8,
          maxWidth: 320,
        }}
      >
        {ALL_PERIODS.map((p) => {
          const active = period === p;
          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`pill ${active ? "is-active" : ""}`}
              style={{ fontSize: 11, padding: "4px 8px" }}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Selected location side panel */}
      {selected && (
        <aside
          className="absolute top-20 left-4 w-[320px] border panel-slide"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
            borderRadius: 8,
            maxHeight: "calc(100% - 120px)",
            overflowY: "auto",
          }}
        >
          <header
            className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div>
              <div
                className="font-serif text-[20px] leading-tight"
                style={{ color: "var(--color-ink)" }}
              >
                {selected.name}
              </div>
              {selected.modernName && (
                <div
                  className="text-[12px] mt-0.5"
                  style={{ color: "var(--color-ink-faint)" }}
                >
                  ({selected.modernName})
                </div>
              )}
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
                <span key={p} className="badge badge-gold">
                  {p}
                </span>
              ))}
            </div>
            <p
              className="text-[13px] leading-[1.65] mb-4"
              style={{ color: "var(--color-ink)" }}
            >
              {selected.description}
            </p>
            <div className="t-label mb-2">Passages</div>
            <ul className="space-y-1">
              {selected.passages.map((p, i) => (
                <li key={i}>
                  <Link
                    href={`/read/${encodeURIComponent(p.book)}/${p.chapter}${
                      p.verse ? `#v${p.verse}` : ""
                    }`}
                    className="font-serif text-[14px]"
                    style={{ color: "var(--color-gold)" }}
                  >
                    {p.book} {p.chapter}
                    {p.verse ? `:${p.verse}` : ""}
                    <span style={{ marginLeft: 6 }}>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}

      {/* Route legend — bottom-left */}
      <div
        className="absolute bottom-4 left-4 border p-3"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
          borderRadius: 8,
          minWidth: 240,
        }}
      >
        <div className="t-label mb-2">Routes</div>
        <div className="flex flex-col gap-1.5">
          {ROUTES.map((r) => {
            const on = activeRoutes.has(r.id);
            return (
              <button
                key={r.id}
                onClick={() => {
                  const next = new Set(activeRoutes);
                  if (on) next.delete(r.id);
                  else next.add(r.id);
                  setActiveRoutes(next);
                }}
                className="flex items-center gap-2 text-left"
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 18,
                    height: 0,
                    borderTop: `2px dashed ${r.color}`,
                    opacity: on ? 1 : 0.35,
                  }}
                />
                <span
                  className="text-[12px]"
                  style={{
                    color: on ? "var(--color-ink)" : "var(--color-ink-faint)",
                  }}
                >
                  {r.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
