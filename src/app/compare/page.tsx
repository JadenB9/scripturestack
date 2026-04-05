import type { Metadata } from "next";
import { BOOKS } from "@/lib/data/books";
import { ComparePage } from "@/components/ComparePage";

export const metadata: Metadata = {
  title: "Compare · ScriptureStack",
};

export default function CompareRoute() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-14 pb-24">
        <header className="mb-8">
          <div className="t-label mb-2">Side by side</div>
          <h1 className="t-h1">Translation Compare</h1>
          <p
            className="mt-3 text-[14px] max-w-[620px]"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Place up to four translations beside one another. Differences from the ESV base text are highlighted at the word level.
          </p>
        </header>
        <ComparePage books={BOOKS} />
      </div>
    </div>
  );
}
