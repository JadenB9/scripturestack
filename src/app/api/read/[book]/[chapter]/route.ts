import { NextResponse } from "next/server";
import { loadChapter } from "@/lib/chapters";
import { getBook } from "@/lib/data/books";
import { fetchAltChapter, isAltTranslation } from "@/lib/translations";

/**
 * GET /api/read/[book]/[chapter]?translation=KJV
 * ESV by default; any of the public-domain translations in lib/translations.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ book: string; chapter: string }> }
) {
  const { book: bookParam, chapter: chapterParam } = await params;
  const book = decodeURIComponent(bookParam);
  const chapter = Number(chapterParam);

  // Only real book/chapter pairs get through — otherwise anything typed into
  // the URL would be forwarded to the ESV API on our key.
  const meta = getBook(book);
  if (!meta || !Number.isInteger(chapter) || chapter < 1 || chapter > meta.chapters) {
    return NextResponse.json({ error: "unknown book or chapter" }, { status: 404 });
  }

  const translation = (new URL(req.url).searchParams.get("translation") ?? "ESV").toUpperCase();

  if (translation === "ESV") {
    const verses = await loadChapter(meta.name, chapter);
    return NextResponse.json({ book: meta.name, chapter, translation, verses });
  }

  if (!isAltTranslation(translation)) {
    return NextResponse.json({ error: "unknown translation" }, { status: 400 });
  }

  try {
    const verses = await fetchAltChapter(meta.name, chapter, translation);
    return NextResponse.json({ book: meta.name, chapter, translation, verses });
  } catch (err) {
    console.error("translation fetch failed", err);
    return NextResponse.json({ error: `${translation} is unavailable right now` }, { status: 502 });
  }
}
