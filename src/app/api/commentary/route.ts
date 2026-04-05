import { NextResponse } from "next/server";
import { getCommentaryForChapter } from "@/lib/data/commentary";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const book = searchParams.get("book");
  const chapter = Number(searchParams.get("chapter"));
  if (!book || Number.isNaN(chapter)) {
    return NextResponse.json({ error: "book and chapter required" }, { status: 400 });
  }
  const entries = getCommentaryForChapter(book, chapter);
  return NextResponse.json({ book, chapter, entries });
}
