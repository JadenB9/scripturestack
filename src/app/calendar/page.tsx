import type { Metadata } from "next";
import { HEBREW_MONTHS } from "@/lib/data/hebrew-calendar";
import { HebrewCalendarGrid } from "@/components/HebrewCalendarGrid";

export const metadata: Metadata = {
  title: "Calendar · ScriptureStack",
};

export default function CalendarPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-14 pb-24">
        <header className="mb-10">
          <div className="t-label mb-2">The appointed times</div>
          <h1 className="t-h1">The Hebrew Calendar</h1>
          <p
            className="mt-3 text-[14px] max-w-[620px]"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Twelve months, the pilgrimage feasts, fasts, and the sabbatical cycles — the rhythms by which Israel ordered its life and by which the story of redemption was kept.
          </p>
        </header>
        <HebrewCalendarGrid months={HEBREW_MONTHS} />
      </div>
    </div>
  );
}
