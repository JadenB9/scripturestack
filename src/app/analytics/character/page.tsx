import type { Metadata } from "next";
import { TextCharacter } from "@/components/analytics/TextCharacter";

export const metadata: Metadata = {
  title: "Text Character · ScriptureStack",
};

export default function CharacterPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1080px] mx-auto px-6 md:px-10 pt-14 pb-24">
        <header className="mb-10">
          <div className="t-label mb-2">Analysis</div>
          <h1 className="t-h1">Text Character</h1>
          <p className="mt-3 text-[14px] max-w-[560px]" style={{ color: "var(--color-ink-muted)" }}>
            The emotional arc and narrative texture of a book, computed chapter by chapter.
            Psalms swings in waves. Romans trends discourse. Mark reads like a pursuit.
          </p>
        </header>
        <TextCharacter />
      </div>
    </div>
  );
}
