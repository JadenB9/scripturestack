"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
// Type-only imports are erased at compile time so they never trigger
// mapbox-gl's module-level code on the server during the initial render.
import type { Map as MapboxMap, Marker as MapboxMarker } from "mapbox-gl";
import { LOCATIONS, ROUTES, type Location, type Period } from "@/lib/data/locations";
import { detectWebGL } from "@/lib/webgl-check";

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
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<MapboxMarker[]>([]);
  const mapboxLibRef = useRef<typeof import("mapbox-gl") | null>(null);
  const [period, setPeriod] = useState<Period | "All">("All");
  const [selected, setSelected] = useState<Location | null>(null);
  const [activeRoutes, setActiveRoutes] = useState<Set<string>>(
    () => new Set(highlightRouteId ? [highlightRouteId] : []),
  );
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  // Lazily load mapbox-gl + its CSS on the client and initialize the map.
  useEffect(() => {
    if (!token) return;
    if (!containerRef.current) return;
    if (mapRef.current) return;

    // Informational WebGL probe — logged but not used as a hard gate.
    // We let mapbox-gl be the source of truth so false negatives in our
    // detection don't block users whose browsers can actually render.
    const webglSupport = detectWebGL();
    // eslint-disable-next-line no-console
    console.info("[atlas] webgl probe:", webglSupport);

    let cancelled = false;
    let map: MapboxMap | null = null;
    let resizeHandle: ReturnType<typeof setTimeout> | null = null;
    let ro: ResizeObserver | null = null;

    (async () => {
      try {
        // Dynamically import so mapbox-gl never runs on the server.
        const mapboxModule = await import("mapbox-gl");
        await import("mapbox-gl/dist/mapbox-gl.css");
        if (cancelled || !containerRef.current) return;

        const mapboxgl = mapboxModule.default;
        mapboxLibRef.current = mapboxModule;
        mapboxgl.accessToken = token;

        map = new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: [35.2, 31.7],
          zoom: 4,
          attributionControl: false,
          // Explicitly allow WebGL 1 so browsers without WebGL 2 still render.
          // Mapbox v3 prefers WebGL 2 but this flag makes it fall back cleanly.
          failIfMajorPerformanceCaveat: false,
          // Silently rewrite telemetry URLs to a no-op data: URL so ad
          // blockers and browser shields don't flood the console with
          // ERR_BLOCKED_BY_CLIENT errors for every map load event.
          // Actual map tiles, styles, and glyphs are never touched.
          transformRequest: (url) => {
            if (url.startsWith("https://events.mapbox.com/")) {
              return { url: "data:," };
            }
            return { url };
          },
        });

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
        resizeHandle = setTimeout(() => map?.resize(), 150);

        // Log the token prefix so a deployed build can be sanity-checked
        // from the devtools console without exposing the full secret.
        // eslint-disable-next-line no-console
        console.info(
          "[atlas] token prefix:",
          token.slice(0, 12) + "…",
          "length:",
          token.length,
        );

        // Timeout: if the style never finishes loading, surface an error
        // instead of sitting on a blank canvas forever.
        const styleTimeout = setTimeout(() => {
          if (!cancelled && !map?.isStyleLoaded()) {
            setLoadError(
              "Mapbox style did not load within 10 seconds. Tile requests are being blocked or the token is being rejected. Check your browser Network tab for 401/403 responses from api.mapbox.com.",
            );
          }
        }, 10000);

        let firstError: string | null = null;
        map.on("error", (e) => {
          const message =
            e?.error?.message || String(e?.error || "unknown mapbox error");
          // eslint-disable-next-line no-console
          console.warn("[atlas] mapbox error:", message, e);
          // Capture the first error and surface it to the user so blank
          // canvases never happen silently again.
          if (!firstError) {
            firstError = message;
            if (!cancelled) setLoadError(message);
          }
        });

        map.once("styledata", () => {
          clearTimeout(styleTimeout);
          // eslint-disable-next-line no-console
          console.info("[atlas] style loaded ok");
        });

        map.on("load", () => {
          if (!map) return;
          try {
            const style = map.getStyle();
            const layers = style?.layers ?? [];
            for (const layer of layers) {
              const id = layer.id;
              if (layer.type === "background") {
                map.setPaintProperty(id, "background-color", "#F3EAD8");
              } else if (layer.type === "fill") {
                if (/water|ocean|sea|river|lake/i.test(id)) {
                  map.setPaintProperty(id, "fill-color", "#D9CDB3");
                } else if (/land|earth|landcover|landuse/i.test(id)) {
                  map.setPaintProperty(id, "fill-color", "#F3EAD8");
                }
              }
            }
          } catch {
            /* ignore tint failures */
          }

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

          if (!cancelled) setMapReady(true);
        });

        mapRef.current = map;

        ro = new ResizeObserver(() => {
          map?.resize();
        });
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

  // Render markers whenever visible set changes.
  useEffect(() => {
    const map = mapRef.current;
    const lib = mapboxLibRef.current;
    if (!map || !mapReady || !lib) return;
    const mapboxgl = lib.default;

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

  if (loadError) {
    const isWebGLError = /webgl/i.test(loadError);
    return (
      <div
        className="h-full w-full flex items-center justify-center px-6"
        style={{ background: "var(--color-parchment)" }}
      >
        <div
          className="border p-6 max-w-[500px] text-left"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
            borderRadius: 8,
          }}
        >
          <div className="t-label mb-3">
            {isWebGLError ? "WebGL could not start" : "Map failed to load"}
          </div>
          <p className="text-[14px] mb-3" style={{ color: "var(--color-ink)" }}>
            {loadError}
          </p>
          {isWebGLError ? (
            <div className="text-[12px] leading-[1.7] space-y-3" style={{ color: "var(--color-ink-muted)" }}>
              <p>
                The Atlas renders through WebGL. Your browser knows WebGL exists
                but refused to give Mapbox a rendering context. A few things to try:
              </p>
              <div>
                <strong className="block mb-1" style={{ color: "var(--color-ink)" }}>Hardware acceleration</strong>
                Open <code>brave://settings/system</code> (or <code>chrome://settings/system</code>) and make sure
                &quot;Use graphics acceleration when available&quot; is ON. Restart the browser after toggling.
              </div>
              <div>
                <strong className="block mb-1" style={{ color: "var(--color-ink)" }}>Check your GPU</strong>
                Open <code>brave://gpu</code>. Near the top, &quot;WebGL&quot; and &quot;WebGL2&quot; should both say
                <em> Hardware accelerated</em>. If either says &quot;Software only&quot; or &quot;Unavailable&quot;, your
                GPU drivers or a browser flag are blocking it.
              </div>
              <div>
                <strong className="block mb-1" style={{ color: "var(--color-ink)" }}>Try another browser</strong>
                Safari, Firefox, or Chrome will tell us quickly whether it&apos;s a
                Brave-specific block or a system-level issue.
              </div>
            </div>
          ) : (
            <p className="text-[11px]" style={{ color: "var(--color-ink-faint)" }}>
              Check your Mapbox token and network connection, then reload the page.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0" style={{ background: "#F3EAD8" }}>
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
