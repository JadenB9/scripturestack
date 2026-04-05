import { NextResponse } from "next/server";
import { WALKTHROUGH } from "@/lib/data/walkthrough";
import { loadChapter } from "@/lib/chapters";

/**
 * GET /api/walkthrough/[stopId]
 * Returns the walkthrough stop metadata plus the verses for its passage.
 * The client fetches this lazily when the user advances to each stop so
 * we don't preload the entire Bible at once.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ stopId: string }> }
) {
  const { stopId } = await params;
  const stop = WALKTHROUGH.find((s) => s.id === stopId);
  if (!stop) {
    return NextResponse.json({ error: "unknown stop" }, { status: 404 });
  }

  // Fetch a small passage window — the whole chapter containing the stop.
  const verses = await loadChapter(stop.passage.book, stop.passage.chapter);

  // Optionally clip to verse range if one was specified.
  let window = verses;
  if (stop.passage.verseStart) {
    const start = stop.passage.verseStart;
    const end = stop.passage.verseEnd ?? start + 4;
    window = verses.filter((v) => v.verse >= start && v.verse <= end);
    if (window.length === 0) window = verses.slice(0, 8);
  } else {
    // First 10 verses of the chapter when no range is given.
    window = verses.slice(0, 10);
  }

  return NextResponse.json({ stop, verses: window });
}
