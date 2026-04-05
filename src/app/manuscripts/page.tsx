import type { Metadata } from "next";
import { MANUSCRIPTS, VARIANTS } from "@/lib/data/manuscripts";
import { VariantTable } from "@/components/VariantTable";
import { ManuscriptCard } from "@/components/ManuscriptCard";

export const metadata: Metadata = {
  title: "Manuscripts · ScriptureStack",
};

export default function ManuscriptsPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-14 pb-24">
        <header className="mb-10">
          <div className="t-label mb-2">Textual witnesses</div>
          <h1 className="t-h1">Manuscripts &amp; Variants</h1>
          <p
            className="mt-3 text-[14px] max-w-[620px]"
            style={{ color: "var(--color-ink-muted)" }}
          >
            The hand-copied witnesses behind every modern translation — and the places they disagree. Each variant is linked to the passages it affects.
          </p>
        </header>

        <section className="mb-14">
          <div className="t-label mb-3">Core witnesses</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MANUSCRIPTS.map((m) => (
              <ManuscriptCard key={m.id} manuscript={m} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="t-h2 mb-4">Textual Variants</h2>
          <VariantTable variants={VARIANTS} />
        </section>
      </div>
    </div>
  );
}
