import { MacroTimeline } from "@/components/MacroTimeline";

export default function TimelinePage() {
  return (
    <div className="px-8 py-10 max-w-[1400px] mx-auto">
      <div className="mb-8 pb-6 border-b" style={{ borderColor: "var(--color-border)" }}>
        <p className="t-label mb-2">Chronology</p>
        <h1 className="t-h1 font-serif" style={{ color: "var(--color-ink)" }}>
          The Macro Timeline
        </h1>
        <p className="mt-2 text-[14px]" style={{ color: "var(--color-ink-muted)" }}>
          From creation to Revelation across 11 epochs and 5 covenants.
        </p>
      </div>

      <MacroTimeline />
    </div>
  );
}
