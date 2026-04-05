/**
 * Feature-detects WebGL support in the current browser. Returns `true` if a
 * WebGL2 or WebGL1 context can be acquired on a test canvas.
 *
 * Brave's aggressive fingerprinting protection and older GPUs are the two
 * most common reasons this returns `false`. We use it to fail fast with a
 * helpful error message instead of letting mapbox-gl throw a generic
 * "Failed to initialize WebGL" deep inside its init code.
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    return !!gl;
  } catch {
    return false;
  }
}
