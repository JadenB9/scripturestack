import { NextResponse } from "next/server";
import { lookupWord, LEXICON_BY_STRONGS } from "@/lib/data/lexicon";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ word: string }> }
) {
  const { word } = await params;
  const decoded = decodeURIComponent(word);

  // Accept either a surface word ("love") or a Strong's number ("G26")
  const byStrongs = LEXICON_BY_STRONGS.get(decoded.toUpperCase());
  if (byStrongs) return NextResponse.json({ entry: byStrongs });

  const entry = lookupWord(decoded);
  if (!entry) return NextResponse.json({ entry: null }, { status: 404 });
  return NextResponse.json({ entry });
}
