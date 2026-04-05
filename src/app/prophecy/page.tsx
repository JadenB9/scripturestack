import type { Metadata } from "next";
import { PROPHECIES } from "@/lib/data/prophecies";
import { ProphecyTracker } from "@/components/ProphecyTracker";

export const metadata: Metadata = {
  title: "Prophecy · ScriptureStack",
};

export default function ProphecyPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-14 pb-24">
        <header className="mb-8">
          <div className="t-label mb-2">Promise and fulfillment</div>
          <h1 className="t-h1">Prophecy Tracker</h1>
          <p
            className="mt-3 text-[14px] max-w-[620px]"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Major prophecies with their Old Testament source and New Testament or historical fulfillment — filtered, sorted, and linked to the text.
          </p>
        </header>
        <ProphecyTracker prophecies={PROPHECIES} />
      </div>
    </div>
  );
}
