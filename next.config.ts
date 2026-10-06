import type { NextConfig } from "next";

// The browser only ever talks to this app and Mapbox. Bible text, the ML
// service and the database are all reached server-side, so they don't need
// to be listed here. 'unsafe-inline' is for Next's inline bootstrap scripts
// and the theme script in layout.tsx; Mapbox GL builds its workers from blobs.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://api.mapbox.com",
  "font-src 'self'",
  // data: covers the Mapbox telemetry calls AtlasMap rewrites to "data:,"
  "connect-src 'self' data: https://api.mapbox.com https://events.mapbox.com",
  "worker-src 'self' blob:",
  "child-src blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  // Dev mode needs eval for React's debug tooling, so the CSP only goes out
  // from production builds.
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
