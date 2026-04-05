import type { Metadata } from "next";
import { SemanticSearch } from "@/components/analytics/SemanticSearch";

export const metadata: Metadata = {
  title: "Semantic Search · ScriptureStack",
};

export default function SemanticPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1080px] mx-auto px-6 md:px-10 pt-14 pb-24">
        <header className="mb-10">
          <div className="t-label mb-2">Analysis</div>
          <h1 className="t-h1">Semantic Search</h1>
          <p className="mt-3 text-[14px] max-w-[560px]" style={{ color: "var(--color-ink-muted)" }}>
            Search scripture by meaning, not just words. Query embeddings are matched against
            every verse in the canon via pgvector cosine similarity.
          </p>
        </header>
        <SemanticSearch />
      </div>
    </div>
  );
}
