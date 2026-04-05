import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { verses } from "@/db/schema";
import { AUTHORS, RADAR_AXES } from "@/lib/data/authors";

/**
 * Mystery-text authorship fingerprint — DB-backed edition.
 *
 * Instead of comparing the input against hand-crafted author metrics,
 * this route pulls the actual ESV text of each author's books from the
 * database, computes the six style metrics on that real corpus, and
 * ranks the input passage by cosine similarity against the real numbers.
 *
 * If a particular author has no verses in the DB yet (seeding is still
 * in progress), we fall back to the static AUTHORS profile so the
 * comparison still produces useful rankings.
 *
 * POST /api/analytics/authorship
 * Body: { text: string }
 */

const IMPERATIVE_MARKERS = [
  "do not", "do ye", "let us", "let him", "let them", "let no",
  "keep", "remember", "hear", "behold", "come", "go", "believe",
  "follow", "love", "pray", "watch", "stand", "seek", "repent",
  "consider", "think", "rejoice", "submit", "resist", "endure",
  "abstain", "flee", "receive", "give", "take", "put on", "put off",
  "trust", "hope", "wait", "cry", "fear", "honor",
];

const PASSIVE_MARKERS = [
  "is written", "was written", "are written", "is called", "was called",
  "is said", "was said", "is given", "was given", "has been", "have been",
  "was crucified", "is raised", "was raised", "are justified", "was delivered",
  "is made", "was made", "shall be", "will be", "is born", "was born",
];

type Metrics = {
  sentenceLength: number;
  vocabRichness: number;
  questionFrequency: number;
  imperativeFrequency: number;
  otQuotations: number;
  passiveVoice: number;
};

// Empirical caps — used to normalize raw metrics into [0, 1].
const CAPS = {
  sentenceLength: 35,
  vocabRichness: 0.75,
  questionFrequency: 25,
  imperativeFrequency: 40,
  otQuotations: 30,
  passiveVoice: 40,
} as const;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!text || text.length < 20) {
    return NextResponse.json(
      { error: "text is required (at least 20 characters)" },
      { status: 400 },
    );
  }

  // 1. Compute metrics on the mystery input.
  const rawInput = computeRawMetrics(text);
  const inputNormalized = normalize(rawInput);

  // 2. Pull every verse for every author's books in one query.
  const allBookNames = Array.from(new Set(AUTHORS.flatMap((a) => a.books)));
  let bookTextByBook = new Map<string, string>();
  try {
    const rows = await db
      .select({ book: verses.book, text: verses.text })
      .from(verses)
      .where(inArray(verses.book, allBookNames));
    for (const row of rows) {
      const prev = bookTextByBook.get(row.book) ?? "";
      bookTextByBook.set(row.book, prev ? prev + " " + row.text : row.text);
    }
  } catch {
    // DB unavailable — continue with empty map so fallback kicks in.
    bookTextByBook = new Map();
  }

  // 3. For each author, compute real metrics from their concatenated text,
  //    or fall back to the static profile if no verses are available.
  const computed = AUTHORS.map((author) => {
    const corpus = author.books
      .map((b) => bookTextByBook.get(b) ?? "")
      .filter((s) => s.length > 0)
      .join(" ");

    let normalized: Metrics;
    let source: "db" | "static";
    if (corpus.length > 500) {
      normalized = normalize(computeRawMetrics(corpus));
      source = "db";
    } else {
      normalized = author.metrics;
      source = "static";
    }

    return { author, normalized, source };
  });

  // 4. Rank by cosine similarity.
  const inputVector = RADAR_AXES.map((ax) => inputNormalized[ax.key]);
  const ranked = computed
    .map(({ author, normalized, source }) => {
      const authorVector = RADAR_AXES.map((ax) => normalized[ax.key]);
      const similarity = cosineSimilarity(inputVector, authorVector);
      return {
        id: author.id,
        name: author.name,
        similarity,
        signature: author.signature,
        source,
      };
    })
    .sort((a, b) => b.similarity - a.similarity);

  // Normalize similarity spread so the bars look meaningful. Cosine on
  // vectors of all-positive values tends to sit in a narrow 0.85–1.00
  // band, so we stretch the range to emphasize relative differences.
  const max = ranked[0]?.similarity ?? 1;
  const min = ranked[ranked.length - 1]?.similarity ?? 0;
  const span = Math.max(max - min, 0.001);
  const rescaled = ranked.map((r, i) => ({
    ...r,
    similarity: r.similarity,
    displayScore:
      i === 0
        ? 1
        : Math.max(0.05, 0.15 + 0.85 * ((r.similarity - min) / span)),
  }));

  return NextResponse.json({
    rawMetrics: rawInput,
    normalizedMetrics: inputNormalized,
    ranked: rescaled,
    topMatch: rescaled[0],
  });
}

function computeRawMetrics(text: string): Metrics {
  const trimmed = text.trim();
  const wordCount = trimmed.split(/\s+/).filter((w) => w.length > 0).length || 1;

  const sentences = trimmed
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : wordCount;

  const tokens = trimmed
    .toLowerCase()
    .replace(/[^a-z\s-]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
  const typeSet = new Set(tokens);
  const ttr = tokens.length > 0 ? typeSet.size / tokens.length : 0;

  const questionMarks = (trimmed.match(/\?/g) || []).length;
  const questionPerThousand = (questionMarks / wordCount) * 1000;

  const lower = " " + trimmed.toLowerCase() + " ";
  let imperativeHits = 0;
  for (const marker of IMPERATIVE_MARKERS) {
    const re = new RegExp(`\\b${marker}\\b`, "g");
    imperativeHits += (lower.match(re) || []).length;
  }
  const imperativesPerThousand = (imperativeHits / wordCount) * 1000;

  const otMarkers = (lower.match(/\b(it is written|as it is written|the prophet|says the lord|saith the lord|moses|isaiah|jeremiah|psalm|law of moses|scripture|scriptures)\b/g) || []).length;
  const otPerThousand = (otMarkers / wordCount) * 1000;

  let passiveHits = 0;
  for (const marker of PASSIVE_MARKERS) {
    const re = new RegExp(`\\b${marker}\\b`, "g");
    passiveHits += (lower.match(re) || []).length;
  }
  const passiveRegex = /\b(was|were|been|being|be)\s+\w+ed\b/g;
  passiveHits += (lower.match(passiveRegex) || []).length;
  const passivePerThousand = (passiveHits / wordCount) * 1000;

  return {
    sentenceLength: avgSentenceLength,
    vocabRichness: ttr,
    questionFrequency: questionPerThousand,
    imperativeFrequency: imperativesPerThousand,
    otQuotations: otPerThousand,
    passiveVoice: passivePerThousand,
  };
}

function normalize(raw: Metrics): Metrics {
  return {
    sentenceLength: clamp01(raw.sentenceLength / CAPS.sentenceLength),
    vocabRichness: clamp01(raw.vocabRichness / CAPS.vocabRichness),
    questionFrequency: clamp01(raw.questionFrequency / CAPS.questionFrequency),
    imperativeFrequency: clamp01(raw.imperativeFrequency / CAPS.imperativeFrequency),
    otQuotations: clamp01(raw.otQuotations / CAPS.otQuotations),
    passiveVoice: clamp01(raw.passiveVoice / CAPS.passiveVoice),
  };
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
