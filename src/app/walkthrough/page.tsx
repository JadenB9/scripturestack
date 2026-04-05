import type { Metadata } from "next";
import { WALKTHROUGH } from "@/lib/data/walkthrough";
import { WalkthroughPlayer } from "@/components/WalkthroughPlayer";

export const metadata: Metadata = {
  title: "Walkthrough · ScriptureStack",
  description:
    "A chronological walk through the Bible — each event on the timeline, located on the map, and anchored in its passage.",
};

export default function WalkthroughPage() {
  return (
    <div className="h-screen flex flex-col">
      <header
        className="px-6 md:px-10 pt-8 pb-5 border-b shrink-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="t-label mb-2">Chronological walk</div>
        <h1 className="t-h1">The Bible, in Order</h1>
        <p
          className="mt-2 text-[13px] max-w-[640px]"
          style={{ color: "var(--color-ink-muted)" }}
        >
          {WALKTHROUGH.length} stations from creation to the Revelation on Patmos. Step
          through at your own pace — the timeline, the map, and the passage stay in sync so you
          can see exactly when and where each event happened.
        </p>
      </header>
      <div className="flex-1 min-h-0">
        <WalkthroughPlayer stops={WALKTHROUGH} />
      </div>
    </div>
  );
}
