import type { Metadata } from "next";
import { BOOKS } from "@/lib/data/books";
import { BooksGrid } from "@/components/BooksGrid";

export const metadata: Metadata = {
  title: "Books · ScriptureStack",
};

export default function BooksPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 pt-14 pb-24">
        <header className="mb-10 md:mb-14">
          <div className="t-label mb-2">The canon</div>
          <h1 className="t-h1">66 Books</h1>
          <p className="mt-3 text-[14px] max-w-[560px]" style={{ color: "var(--color-ink-muted)" }}>
            Every book of scripture with author, date, and key theme. Hover a card to flip it; click Read to open the first chapter.
          </p>
        </header>
        <BooksGrid books={BOOKS} />
      </div>
    </div>
  );
}
