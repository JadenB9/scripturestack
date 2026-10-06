/**
 * Public-domain translations for the Compare page and the reading view's
 * parallel panel. ESV comes from our own DB / the ESV API (see chapters.ts);
 * everything else comes from bible-api.com, which serves public-domain texts
 * by book id + chapter with no API key.
 */

export const ALT_TRANSLATIONS = [
  { id: "KJV", apiId: "kjv", name: "King James Version (1611)" },
  { id: "ASV", apiId: "asv", name: "American Standard Version (1901)" },
  { id: "WEB", apiId: "web", name: "World English Bible" },
  { id: "BBE", apiId: "bbe", name: "Bible in Basic English" },
] as const;

export type AltTranslationId = (typeof ALT_TRANSLATIONS)[number]["id"];
export type TranslationId = "ESV" | AltTranslationId;

export const TRANSLATION_IDS: TranslationId[] = ["ESV", ...ALT_TRANSLATIONS.map((t) => t.id)];

export function isAltTranslation(id: string): id is AltTranslationId {
  return ALT_TRANSLATIONS.some((t) => t.id === id);
}

// bible-api.com uses USFM-style book ids.
const BOOK_IDS: Record<string, string> = {
  Genesis: "GEN", Exodus: "EXO", Leviticus: "LEV", Numbers: "NUM", Deuteronomy: "DEU",
  Joshua: "JOS", Judges: "JDG", Ruth: "RUT", "1 Samuel": "1SA", "2 Samuel": "2SA",
  "1 Kings": "1KI", "2 Kings": "2KI", "1 Chronicles": "1CH", "2 Chronicles": "2CH",
  Ezra: "EZR", Nehemiah: "NEH", Esther: "EST", Job: "JOB", Psalms: "PSA", Proverbs: "PRO",
  Ecclesiastes: "ECC", "Song of Solomon": "SNG", Isaiah: "ISA", Jeremiah: "JER",
  Lamentations: "LAM", Ezekiel: "EZK", Daniel: "DAN", Hosea: "HOS", Joel: "JOL", Amos: "AMO",
  Obadiah: "OBA", Jonah: "JON", Micah: "MIC", Nahum: "NAM", Habakkuk: "HAB", Zephaniah: "ZEP",
  Haggai: "HAG", Zechariah: "ZEC", Malachi: "MAL", Matthew: "MAT", Mark: "MRK", Luke: "LUK",
  John: "JHN", Acts: "ACT", Romans: "ROM", "1 Corinthians": "1CO", "2 Corinthians": "2CO",
  Galatians: "GAL", Ephesians: "EPH", Philippians: "PHP", Colossians: "COL",
  "1 Thessalonians": "1TH", "2 Thessalonians": "2TH", "1 Timothy": "1TI", "2 Timothy": "2TI",
  Titus: "TIT", Philemon: "PHM", Hebrews: "HEB", James: "JAS", "1 Peter": "1PE",
  "2 Peter": "2PE", "1 John": "1JN", "2 John": "2JN", "3 John": "3JN", Jude: "JUD",
  Revelation: "REV",
};

export async function fetchAltChapter(
  book: string,
  chapter: number,
  id: AltTranslationId
): Promise<Array<{ verse: number; text: string }>> {
  const bookId = BOOK_IDS[book];
  const apiId = ALT_TRANSLATIONS.find((t) => t.id === id)?.apiId;
  if (!bookId || !apiId) return [];

  const res = await fetch(`https://bible-api.com/data/${apiId}/${bookId}/${chapter}`, {
    // Public-domain text never changes, so cache it hard.
    next: { revalidate: 60 * 60 * 24 * 30 },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`bible-api ${res.status} for ${id} ${book} ${chapter}`);

  const data = (await res.json()) as { verses?: Array<{ verse: number; text: string }> };
  return (data.verses ?? []).map((v) => ({
    verse: v.verse,
    // The KJV data has stray line breaks where the italic words used to be.
    text: v.text.replace(/\s+/g, " ").trim(),
  }));
}

export type DiffToken = { text: string; differs: boolean };

/**
 * Word-level diff of `other` against `base` using a longest-common-subsequence
 * table, so one inserted word doesn't mark the rest of the verse as changed.
 * Comparison ignores case and punctuation. Verses are short, so O(n*m) is fine.
 */
export function diffWords(base: string, other: string): DiffToken[] {
  const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
  const a = base.split(/\s+/).filter(Boolean).map(norm);
  const words = other.split(/\s+/).filter(Boolean);
  const b = words.map(norm);

  const lcs: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const out: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (j < b.length) {
    if (i < a.length && a[i] === b[j]) {
      out.push({ text: words[j], differs: false });
      i++;
      j++;
    } else if (i < a.length && lcs[i + 1][j] >= lcs[i][j + 1]) {
      i++;
    } else {
      out.push({ text: words[j], differs: b[j] !== "" });
      j++;
    }
  }
  return out;
}
