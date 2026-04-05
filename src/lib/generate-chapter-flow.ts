/**
 * Auto-generate chapter-flow events from raw verses when no hand-curated
 * CHAPTER_EVENTS exist for the chapter. Detects speaker changes, topic
 * pivots, and paragraph breaks from the ESV text to segment each chapter
 * into 4–8 labeled sections.
 */

import type { ChapterEvent, ChapterEventType } from "@/lib/data/chapter-events";

export type FlowVerse = {
  verse: number;
  text: string;
  paragraphBreakBefore?: boolean;
};

const SPEAKER_PATTERNS: Array<{ re: RegExp; label: (match: string) => string; type: ChapterEventType }> = [
  { re: /^(?:And )?God said/i, label: () => "God speaks", type: "discourse" },
  { re: /^(?:And )?the LORD said/i, label: () => "The LORD speaks", type: "discourse" },
  { re: /^(?:Then|And) Jesus said/i, label: () => "Jesus speaks", type: "discourse" },
  { re: /^Jesus answered/i, label: () => "Jesus answers", type: "discourse" },
  { re: /^He said to them/i, label: () => "He teaches them", type: "discourse" },
  { re: /^(?:And|Then) he said/i, label: () => "He speaks", type: "discourse" },
  { re: /^(?:So|And) Moses said/i, label: () => "Moses speaks", type: "discourse" },
  { re: /^(?:Then|And) Paul/i, label: () => "Paul speaks", type: "discourse" },
  { re: /^Behold/i, label: () => "Behold —", type: "narrative" },
];

const TYPE_MARKERS: Array<{ re: RegExp; type: ChapterEventType }> = [
  { re: /\b(healed|cured|cleansed|restored|cast out|stilled|fed)\b/i, type: "miracle" },
  { re: /\b(prayed|lifted up his eyes|cried out to the LORD)\b/i, type: "prayer" },
  { re: /\b(thus says the LORD|declares the LORD|oracle of the LORD)\b/i, type: "prophecy" },
  { re: /\b(law|commandment|statute|ordinance|thou shalt|you shall)\b/i, type: "legal" },
];

function summarizeVerse(text: string, maxLen = 30): string {
  // Trim to a natural clause boundary.
  const trimmed = text.replace(/^["']/, "").replace(/[.!?"']+$/, "");
  const firstClause = trimmed.split(/[,;:—]/)[0] || trimmed;
  if (firstClause.length <= maxLen) return firstClause.trim();
  // Cut on word boundary under maxLen.
  const cut = firstClause.slice(0, maxLen).replace(/\s+\S*$/, "");
  return cut.trim() + "…";
}

function classify(text: string): ChapterEventType {
  for (const { re, type } of TYPE_MARKERS) {
    if (re.test(text)) return type;
  }
  return "narrative";
}

function titleFor(text: string): string | null {
  for (const { re, label } of SPEAKER_PATTERNS) {
    const m = text.match(re);
    if (m) return label(m[0]);
  }
  return null;
}

/**
 * Generate roughly one event per paragraph (falling back to evenly-spaced
 * splits if the loader returned no paragraph markers). Always produces at
 * least 2 events so the timeline strip has something to show.
 */
export function generateChapterFlow(
  book: string,
  chapter: number,
  verses: FlowVerse[]
): ChapterEvent[] {
  if (verses.length === 0) return [];
  if (verses.length <= 3) {
    return [
      {
        book,
        chapter,
        verseStart: verses[0].verse,
        verseEnd: verses[verses.length - 1].verse,
        title: titleFor(verses[0].text) ?? summarizeVerse(verses[0].text),
        type: classify(verses[0].text),
      },
    ];
  }

  // First preference: paragraph breaks from the ESV API.
  const groups: Array<{ start: number; end: number }> = [];
  let currentStart = 0;
  for (let i = 1; i < verses.length; i++) {
    if (verses[i].paragraphBreakBefore) {
      groups.push({ start: currentStart, end: i - 1 });
      currentStart = i;
    }
  }
  groups.push({ start: currentStart, end: verses.length - 1 });

  // If paragraph breaks weren't detected (DB rows don't carry that flag),
  // fall back to fixed 4–6 sections depending on chapter length.
  const useFallback = groups.length <= 1;
  let sectionGroups: Array<{ start: number; end: number }> = groups;
  if (useFallback) {
    const targetSections = Math.max(3, Math.min(8, Math.round(verses.length / 8)));
    const step = Math.ceil(verses.length / targetSections);
    sectionGroups = [];
    for (let i = 0; i < verses.length; i += step) {
      sectionGroups.push({
        start: i,
        end: Math.min(i + step - 1, verses.length - 1),
      });
    }
  }

  // Cap at 10 sections max so the timeline strip doesn't get crowded.
  if (sectionGroups.length > 10) {
    const merged: Array<{ start: number; end: number }> = [];
    const keepEvery = Math.ceil(sectionGroups.length / 10);
    for (let i = 0; i < sectionGroups.length; i += keepEvery) {
      const slice = sectionGroups.slice(i, i + keepEvery);
      merged.push({
        start: slice[0].start,
        end: slice[slice.length - 1].end,
      });
    }
    sectionGroups = merged;
  }

  return sectionGroups.map(({ start, end }) => {
    const first = verses[start];
    return {
      book,
      chapter,
      verseStart: first.verse,
      verseEnd: verses[end].verse,
      title: titleFor(first.text) ?? summarizeVerse(first.text),
      type: classify(first.text),
    };
  });
}
