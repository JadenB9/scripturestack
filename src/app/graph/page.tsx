import { CrossRefGraph } from "@/components/CrossRefGraph";

export default function GraphPage() {
  return (
    <div className="px-8 py-10 max-w-[1400px] mx-auto">
      <div className="mb-8 pb-6 border-b" style={{ borderColor: "var(--color-border)" }}>
        <p className="t-label mb-2">Network</p>
        <h1 className="t-h1 font-serif" style={{ color: "var(--color-ink)" }}>
          Cross-reference Graph
        </h1>
        <p className="mt-2 text-[14px]" style={{ color: "var(--color-ink-muted)" }}>
          The conversation between verses — drag, zoom, and search to trace how scripture quotes itself.
        </p>
      </div>

      <CrossRefGraph />
    </div>
  );
}
