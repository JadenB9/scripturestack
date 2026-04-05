import { NextResponse } from "next/server";
import { loadChapter } from "@/lib/chapters";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ book: string; chapter: string }> }
) {
  const { book: bookParam, chapter: chapterParam } = await params;
  const book = decodeURIComponent(bookParam);
  const chapter = Number(chapterParam);
  if (!book || Number.isNaN(chapter)) {
    return NextResponse.json({ error: "invalid book/chapter" }, { status: 400 });
  }
  const verses = await loadChapter(book, chapter);
  return NextResponse.json({ book, chapter, verses });
}
