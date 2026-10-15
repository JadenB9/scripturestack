import { ImageResponse } from "next/og";
import { getBook } from "@/lib/data/books";
import { loadChapter } from "@/lib/chapters";
import { OG_SIZE, ogCard } from "@/lib/og";

// Share card for a chapter: "John 3" plus the opening verse when the text is
// available. Verse links (#v16) share the chapter's card — the fragment never
// reaches the server.
export const alt = "Read this chapter on ScriptureStack";
export const size = OG_SIZE;
export const contentType = "image/png";

type Props = { params: Promise<{ book: string; chapter: string }> };

export default async function Image({ params }: Props) {
  const { book: bookParam, chapter: chapterParam } = await params;
  const meta = getBook(decodeURIComponent(bookParam));
  const chapter = Number(chapterParam);
  const valid = meta && Number.isInteger(chapter) && chapter >= 1 && chapter <= meta.chapters;

  if (!valid) {
    return new ImageResponse(
      ogCard({ kicker: "ScriptureStack", title: "Chapter not found", subtitle: "" }),
      { ...size }
    );
  }

  // First verse as the teaser. loadChapter already swallows DB/API failures
  // and returns [] — the card still works, just without a quote.
  let opening = "";
  try {
    const verses = await loadChapter(meta.name, chapter);
    opening = verses[0]?.text ?? "";
  } catch {}
  if (opening.length > 150) opening = opening.slice(0, 147).replace(/\s+\S*$/, "") + "…";

  return new ImageResponse(
    ogCard({
      kicker: `${meta.testament === "OT" ? "Old Testament" : "New Testament"} · ${meta.genre}`,
      title: `${meta.name} ${chapter}`,
      subtitle: opening ? `“${opening}”` : meta.theme,
      footer: "scripturestack.j4den.com · ESV",
    }),
    { ...size }
  );
}
