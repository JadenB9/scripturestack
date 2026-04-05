import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { verses } from "@/db/schema";

/**
 * Per-chapter sentiment and narrative-texture analysis for one book.
 *
 * GET /api/analytics/character?book=John
 *
 * Uses a small baked-in lexicon + genre heuristics — cheap but directionally
 * useful for the sentiment arc and stacked narrative-texture bars.
 */

const POSITIVE_WORDS = new Set([
  "love", "loved", "loves", "loving", "beloved",
  "joy", "joyful", "rejoice", "rejoicing", "glad",
  "peace", "peaceful",
  "hope", "hopeful",
  "faith", "faithful",
  "blessed", "bless", "blessing",
  "praise", "praised", "praising",
  "glory", "glorious", "glorified",
  "mercy", "merciful",
  "light", "life", "living", "alive",
  "good", "goodness",
  "save", "saved", "salvation",
  "deliver", "delivered", "deliverance",
  "grace", "gracious",
  "righteous", "righteousness",
  "holy", "holiness",
  "comfort", "comforted",
]);

const NEGATIVE_WORDS = new Set([
  "death", "die", "died", "dead", "dying",
  "wrath", "anger", "angry",
  "sin", "sins", "sinful", "sinner", "sinners",
  "evil", "wicked", "wickedness",
  "curse", "cursed",
  "destroy", "destruction", "destroyed",
  "judgment", "judged", "condemn", "condemned", "condemnation",
  "fear", "afraid", "terror", "terrified",
  "weep", "wept", "mourn", "mourning",
  "suffer", "suffered", "suffering",
  "perish", "perished",
  "darkness", "dark",
  "sorrow", "sorrowful",
  "pain", "painful",
  "enemy", "enemies",
]);

const POETRY_BOOKS = new Set([
  "Psalms",
  "Song of Solomon",
  "Lamentations",
  "Proverbs",
  "Job",
  "Ecclesiastes",
]);

type ChapterCharacter = {
  chapter: number;
  sentiment: number;
  contentType: { narrative: number; discourse: number; poetry: number };
  sampleFirstVerse: string;
  verseCount: number;
  dominantTone: "positive" | "neutral" | "negative";
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const book = url.searchParams.get("book")?.trim() || "";

  if (!book) {
    return NextResponse.json({ error: "book is required" }, { status: 400 });
  }

  const rows = await db
    .select({
      chapter: verses.chapter,
      verse: verses.verse,
      text: verses.text,
    })
    .from(verses)
    .where(eq(verses.book, book))
    .orderBy(asc(verses.chapter), asc(verses.verse));

  if (rows.length === 0) {
    return NextResponse.json({ book, chapters: [] as ChapterCharacter[], notIndexed: true });
  }

  // Group verses by chapter
  const byChapter = new Map<number, Array<{ verse: number; text: string }>>();
  for (const row of rows) {
    let arr = byChapter.get(row.chapter);
    if (!arr) {
      arr = [];
      byChapter.set(row.chapter, arr);
    }
    arr.push({ verse: row.verse, text: row.text });
  }

  const chapters: ChapterCharacter[] = [];
  const sortedChapterNumbers = [...byChapter.keys()].sort((a, b) => a - b);

  for (const chapterNum of sortedChapterNumbers) {
    const verseRows = byChapter.get(chapterNum) ?? [];
    verseRows.sort((a, b) => a.verse - b.verse);

    let pos = 0;
    let neg = 0;
    let imperatives = 0;
    let firstPerson = 0;
    let totalTokens = 0;
    let avgVerseLength = 0;
    let shortLines = 0;

    for (const v of verseRows) {
      const tokens = tokenize(v.text);
      totalTokens += tokens.length;
      avgVerseLength += tokens.length;
      if (tokens.length <= 10) shortLines += 1;

      for (const tok of tokens) {
        if (POSITIVE_WORDS.has(tok)) pos += 1;
        if (NEGATIVE_WORDS.has(tok)) neg += 1;
        if (tok === "i" || tok === "me" || tok === "my" || tok === "mine") firstPerson += 1;
      }

      // crude imperative heuristic: second-person directives
      if (/\b(do not|do ye|let us|let him|let them|keep|remember|hear|behold|come|go|believe|follow|love|pray|watch|stand|seek|repent)\b/i.test(v.text)) {
        imperatives += 1;
      }
    }

    const total = Math.max(pos + neg, 1);
    const sentiment = (pos - neg) / total;

    avgVerseLength = verseRows.length > 0 ? avgVerseLength / verseRows.length : 0;
    const shortRatio = verseRows.length > 0 ? shortLines / verseRows.length : 0;
    const imperativeRatio = verseRows.length > 0 ? imperatives / verseRows.length : 0;
    const firstPersonRatio = totalTokens > 0 ? firstPerson / totalTokens : 0;

    const contentType = classifyContent({
      book,
      shortRatio,
      imperativeRatio,
      firstPersonRatio,
      avgVerseLength,
    });

    const dominantTone: "positive" | "neutral" | "negative" =
      sentiment > 0.1 ? "positive" : sentiment < -0.1 ? "negative" : "neutral";

    chapters.push({
      chapter: chapterNum,
      sentiment: Number(sentiment.toFixed(3)),
      contentType,
      sampleFirstVerse: verseRows[0]?.text ?? "",
      verseCount: verseRows.length,
      dominantTone,
    });
  }

  return NextResponse.json({ book, chapters, notIndexed: false });
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201C\u201D]/g, "'")
    .replace(/['"]/g, "")
    .replace(/[^a-z\s-]+/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function classifyContent(args: {
  book: string;
  shortRatio: number;
  imperativeRatio: number;
  firstPersonRatio: number;
  avgVerseLength: number;
}): { narrative: number; discourse: number; poetry: number } {
  const { book, shortRatio, imperativeRatio, firstPersonRatio } = args;

  let poetry = 0;
  let discourse = 0;
  let narrative = 0;

  // Base genre weight
  if (POETRY_BOOKS.has(book)) {
    poetry += 60;
  }

  // Short lines → poetic structure
  poetry += Math.round(shortRatio * 40);

  // Imperatives + first-person → discourse / exhortation
  discourse += Math.round(imperativeRatio * 60);
  discourse += Math.round(firstPersonRatio * 800); // first-person is dense in discourse

  // Whatever is left is narrative
  const assigned = poetry + discourse;
  narrative = Math.max(0, 100 - assigned);

  // Normalize to exactly 100
  const sum = narrative + discourse + poetry;
  if (sum === 0) {
    return { narrative: 100, discourse: 0, poetry: 0 };
  }
  return {
    narrative: Math.round((narrative / sum) * 100),
    discourse: Math.round((discourse / sum) * 100),
    poetry: Math.round((poetry / sum) * 100),
  };
}
