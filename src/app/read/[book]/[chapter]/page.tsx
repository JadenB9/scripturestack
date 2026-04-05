import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook, BOOKS } from "@/lib/data/books";
import { loadChapter } from "@/lib/chapters";
import { getEventsForChapter } from "@/lib/data/chapter-events";
import { VARIANTS } from "@/lib/data/manuscripts";
import { ReadingView } from "@/components/ReadingView";

type PageProps = {
  params: Promise<{ book: string; chapter: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { book: bookParam, chapter: chapterParam } = await params;
  const book = decodeURIComponent(bookParam);
  return {
    title: `${book} ${chapterParam} · ScriptureStack`,
    description: `Read ${book} chapter ${chapterParam} with annotations, commentary, lexicon, and textual variants.`,
  };
}

export default async function ReadPage({ params }: PageProps) {
  const { book: bookParam, chapter: chapterParam } = await params;
  const book = decodeURIComponent(bookParam);
  const chapter = Number(chapterParam);
  const meta = getBook(book);
  if (!meta || Number.isNaN(chapter) || chapter < 1 || chapter > meta.chapters) {
    notFound();
  }

  const verses = await loadChapter(book, chapter);
  const events = getEventsForChapter(book, chapter);

  // Flag verses that have textual variants by verse number.
  const variantVerses = new Set<number>();
  for (const v of VARIANTS) {
    if (v.book === book && v.chapter === chapter) variantVerses.add(v.verseStart);
  }

  // Prev/next chapter navigation across books.
  const bookIdx = BOOKS.findIndex((b) => b.name === book);
  const prev =
    chapter > 1
      ? { book, chapter: chapter - 1 }
      : bookIdx > 0
      ? { book: BOOKS[bookIdx - 1].name, chapter: BOOKS[bookIdx - 1].chapters }
      : null;
  const next =
    chapter < meta.chapters
      ? { book, chapter: chapter + 1 }
      : bookIdx < BOOKS.length - 1
      ? { book: BOOKS[bookIdx + 1].name, chapter: 1 }
      : null;

  return (
    <ReadingView
      book={book}
      chapter={chapter}
      verses={verses.map((v) => ({
        book: v.book,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text,
        paragraphBreakBefore: v.paragraphBreakBefore,
      }))}
      events={events}
      variantVerses={Array.from(variantVerses)}
      totalChapters={meta.chapters}
      prev={prev}
      next={next}
    />
  );
}
