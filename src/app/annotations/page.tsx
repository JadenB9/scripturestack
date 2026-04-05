import type { Metadata } from "next";
import { AnnotationLibrary } from "@/components/AnnotationLibrary";

export const metadata: Metadata = {
  title: "Annotations · ScriptureStack",
};

export default function AnnotationsPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1080px] mx-auto px-6 md:px-10 pt-14 pb-24">
        <header className="mb-8">
          <div className="t-label mb-2">Your library</div>
          <h1 className="t-h1">Annotations</h1>
          <p className="mt-3 text-[14px] max-w-[560px]" style={{ color: "var(--color-ink-muted)" }}>
            Every note, highlight, and cross-reference you&apos;ve added. Stored on this device — export anytime.
          </p>
        </header>
        <AnnotationLibrary />
      </div>
    </div>
  );
}
