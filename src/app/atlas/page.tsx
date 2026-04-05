import type { Metadata } from "next";
import { AtlasMap } from "@/components/AtlasMap";

export const metadata: Metadata = {
  title: "Atlas · ScriptureStack",
};

export default function AtlasPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="px-6 md:px-10 pt-10 pb-6 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="t-label mb-2">Biblical geography</div>
        <h1 className="t-h1">Atlas</h1>
        <p
          className="mt-3 text-[14px] max-w-[620px]"
          style={{ color: "var(--color-ink-muted)" }}
        >
          The places where the story happened. Click a site to read its passages; toggle routes to trace the journeys of patriarchs, Israel, and the apostles.
        </p>
      </header>
      <div className="flex-1 relative min-h-[640px]">
        <AtlasMap />
      </div>
    </div>
  );
}
