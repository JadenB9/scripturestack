import type { Metadata } from "next";
import { FrequencyAnalyzer } from "@/components/analytics/FrequencyAnalyzer";

export const metadata: Metadata = {
  title: "Frequency · ScriptureStack",
};

export default function FrequencyPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-14 pb-24">
        <header className="mb-10">
          <div className="t-label mb-2">Analytics</div>
          <h1 className="t-h1">Frequency</h1>
          <p className="mt-3 text-[14px] max-w-[620px]" style={{ color: "var(--color-ink-muted)" }}>
            Tally the words Scripture itself keeps returning to. Analyze a passage for its most
            frequent content words, or see how twelve core doctrines are distributed across the
            New Testament.
          </p>
        </header>
        <FrequencyAnalyzer />
      </div>
    </div>
  );
}
