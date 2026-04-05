/**
 * Feature-detects WebGL support in the current browser.
 *
 * Important: each context type attempt must use a FRESH canvas element.
 * Per the WebGL spec, once you call `getContext(type)` on a canvas, later
 * calls with a different type return `null` even if they would otherwise
 * have worked — so chaining `getContext('webgl2') || getContext('webgl')`
 * on the same canvas produces false negatives.
 *
 * We return a discriminated result so callers can distinguish "WebGL is
 * completely unavailable" from "only WebGL 1 is available" (mapbox-gl
 * v3 prefers WebGL 2 but can fall back in many cases).
 */

export type WebGLSupport = "webgl2" | "webgl1" | "none";

function tryContext(type: "webgl2" | "webgl" | "experimental-webgl"): boolean {
  try {
    const canvas = document.createElement("canvas");
    // Use a non-zero size — some driver combinations refuse 0x0.
    canvas.width = 16;
    canvas.height = 16;
    const gl = canvas.getContext(type, {
      failIfMajorPerformanceCaveat: false,
      antialias: false,
    });
    if (!gl) return false;
    // Some drivers return a "null" context — verify it's usable.
    const realGl = gl as WebGLRenderingContext;
    if (typeof realGl.getParameter !== "function") return false;
    return true;
  } catch {
    return false;
  }
}

export function detectWebGL(): WebGLSupport {
  if (typeof window === "undefined") return "none";
  if (tryContext("webgl2")) return "webgl2";
  if (tryContext("webgl")) return "webgl1";
  if (tryContext("experimental-webgl")) return "webgl1";
  return "none";
}

/** Back-compat boolean helper. */
export function isWebGLAvailable(): boolean {
  return detectWebGL() !== "none";
}
