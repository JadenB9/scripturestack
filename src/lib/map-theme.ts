/**
 * Mapbox styling shared by the Atlas and the Walkthrough map. Each theme
 * picks a Mapbox base style and the tints we paint over it so the map sits
 * on the same parchment/ink palette as the rest of the page.
 */

import type { Map as MapboxMap } from "mapbox-gl";
import type { Theme } from "./theme";

export const MAP_STYLES: Record<Theme, string> = {
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
};

export const MAP_PALETTE: Record<
  Theme,
  { land: string; label: string; halo: string; markerStroke: string; borderOpacity: number }
> = {
  light: { land: "#F3EAD8", label: "#44403C", halo: "#F3EAD8", markerStroke: "#FFFFFF", borderOpacity: 0.15 },
  dark: { land: "#221F1A", label: "#D6CFC3", halo: "#1A1815", markerStroke: "#14120F", borderOpacity: 0.3 },
};

export type TintOptions = {
  theme: Theme;
  /** Water colour — the two maps use different ones. */
  water: string;
  /** Show the base style's modern place names and road labels. */
  modernNames?: boolean;
  /** Show modern country borders (faded). */
  borders?: boolean;
};

/**
 * Recolour the base style's land, water and borders, and hide or show its
 * labels. Safe to call again after map.setStyle() — it only touches layers
 * that belong to the base style (ours all start with "locations-" or
 * "journey-route-").
 */
export function tintBaseStyle(map: MapboxMap, opts: TintOptions) {
  const palette = MAP_PALETTE[opts.theme];
  const showNames = opts.modernNames ?? true;
  const showBorders = opts.borders ?? true;
  try {
    for (const layer of map.getStyle()?.layers ?? []) {
      if (isOurLayer(layer.id)) continue;
      if (layer.type === "background") {
        map.setPaintProperty(layer.id, "background-color", palette.land);
      } else if (layer.type === "fill") {
        if (/water|ocean|sea|river|lake/i.test(layer.id)) {
          map.setPaintProperty(layer.id, "fill-color", opts.water);
        } else if (/land|earth|landcover|landuse/i.test(layer.id)) {
          map.setPaintProperty(layer.id, "fill-color", palette.land);
        }
      } else if (layer.type === "line") {
        if (/admin|boundary|border/i.test(layer.id)) {
          map.setPaintProperty(layer.id, "line-opacity", showBorders ? palette.borderOpacity : 0);
        }
      } else if (layer.type === "symbol") {
        map.setLayoutProperty(layer.id, "visibility", showNames ? "visible" : "none");
      }
    }
  } catch {
    // A style we don't recognise just keeps its own colours.
  }
}

export function isOurLayer(id: string): boolean {
  return id.startsWith("locations-") || id.startsWith("journey-route-");
}

/**
 * Switch the base style for a theme. diff: false forces a full reload so
 * style.load fires and the caller can rebuild its overlays — a diffed swap
 * silently drops any layers we added and never fires it.
 */
export function swapStyle(map: MapboxMap, theme: Theme) {
  // mapbox-gl's SetStyleOptions type marks the two font options as required
  // even though the runtime treats them as optional; only diff is wanted here.
  const opts = { diff: false } as unknown as Parameters<MapboxMap["setStyle"]>[1];
  map.setStyle(MAP_STYLES[theme], opts);
}
