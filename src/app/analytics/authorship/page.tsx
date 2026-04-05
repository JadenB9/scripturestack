import type { Metadata } from "next";
import { AuthorshipFingerprint } from "@/components/analytics/AuthorshipFingerprint";

export const metadata: Metadata = {
  title: "Authorship Fingerprint · ScriptureStack",
};

export default function AuthorshipPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-14 pb-24">
        <header className="mb-10">
          <div className="t-label mb-2">Analysis</div>
          <h1 className="t-h1">Authorship Fingerprint</h1>
          <p className="mt-3 text-[14px] max-w-[620px]" style={{ color: "var(--color-ink-muted)" }}>
            Every writer has a fingerprint. Paul asks questions. Luke writes long sentences.
            Mark is short and urgent. James gives commands. Paste any passage below to see which
            hand it most resembles.
          </p>
        </header>
        <AuthorshipFingerprint />
      </div>
    </div>
  );
}
