import { NextResponse } from "next/server";
import { AUTHORS, RADAR_AXES, type AuthorProfile } from "@/lib/data/authors";

/**
 * Mystery-text authorship fingerprint.
 *
 * POST /api/analytics/authorship
 * Body: { text: string }
 *
 * Computes the six style metrics used in the AUTHORS data (sentence length,
 * vocab richness, question frequency, imperative frequency, OT-quotation
 * density, passive voice) over the input text, normalizes them into [0,1],
 * and ranks the 7 canonical NT authors by cosine similarity.
 */

const IMPERATIVE_MARKERS = [
  "do not", "do ye", "let us", "let him", "let them", "let no",
  "keep", "remember", "hear", "behold", "come", "go", "believe",
  "follow", "love", "pray", "watch", "stand", "seek", "repent",
  "consider", "think", "rejoice", "submit", "resist", "endure",
  "abstain", "flee", "receive", "give", "take", "put on", "put off",
];

const PASSIVE_MARKERS = [
  "is written", "was written", "are written", "is called", "was called",
  "is said", "was said", "is given", "was given", "has been", "have been",
  "was crucified", "is raised", "was raised", "are justified", "was delivered",
  "is made", "was made", "shall be", "will be", "is born", "was born",
];

type Metrics = AuthorProfile["metrics"];

// Empirical caps — used to normalize raw metrics into [0, 1] so they can be
// compared to the pre-normalized AUTHORS data.
const CAPS = {
  sentenceLength: 35,    // words per sentence
  vocabRichness: 0.75,   // type/token ratio
  questionFrequency: 25, // questions per 1000 words
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

  const raw = computeRawMetrics(text);
  const normalized: Metrics = {
    sentenceLength: clamp01(raw.sentenceLength / CAPS.sentenceLength),
    vocabRichness: clamp01(raw.vocabRichness / CAPS.vocabRichness),
    questionFrequency: clamp01(raw.questionFrequency / CAPS.questionFrequency),
    imperativeFrequency: clamp01(raw.imperativeFrequency / CAPS.imperativeFrequency),
    otQuotations: clamp01(raw.otQuotations / CAPS.otQuotations),
    passiveVoice: clamp01(raw.passiveVoice / CAPS.passiveVoice),
  };

  const inputVector = RADAR_AXES.map((ax) => normalized[ax.key]);

  const ranked = AUTHORS.map((author) => {
    const authorVector = RADAR_AXES.map((ax) => author.metrics[ax.key]);
    const similarity = cosineSimilarity(inputVector, authorVector);
    return {
      id: author.id,
      name: author.name,
      similarity,
      signature: author.signature,
    };
  }).sort((a, b) => b.similarity - a.similarity);

  return NextResponse.json({
    rawMetrics: raw,
    normalizedMetrics: normalized,
    ranked,
    topMatch: ranked[0],
  });
}

function computeRawMetrics(text: string): Metrics {
  const trimmed = text.trim();
  const wordCount = trimmed.split(/\s+/).filter((w) => w.length > 0).length || 1;

  // Sentences (very loose split)
  const sentences = trimmed
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : wordCount;

  // Type-token ratio
  const tokens = trimmed
    .toLowerCase()
    .replace(/[^a-z\s-]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
  const typeSet = new Set(tokens);
  const ttr = tokens.length > 0 ? typeSet.size / tokens.length : 0;

  // Questions / 1000 words
  const questionMarks = (trimmed.match(/\?/g) || []).length;
  const questionPerThousand = (questionMarks / wordCount) * 1000;

  // Imperatives / 1000 words
  const lower = " " + trimmed.toLowerCase() + " ";
  let imperativeHits = 0;
  for (const marker of IMPERATIVE_MARKERS) {
    const re = new RegExp(`\\b${marker}\\b`, "g");
    imperativeHits += (lower.match(re) || []).length;
  }
  const imperativesPerThousand = (imperativeHits / wordCount) * 1000;

  // OT-quotation density heuristic: look for "it is written", "as it is written",
  // book names, or the word "prophet".
  const otMarkers = (lower.match(/\b(it is written|as it is written|the prophet|says the lord|saith the lord|moses|isaiah|jeremiah|psalm|law of moses|scripture|scriptures)\b/g) || []).length;
  const otPerThousand = (otMarkers / wordCount) * 1000;

  // Passive voice heuristic: look for markers + "be/was/were/been + past participle"
  let passiveHits = 0;
  for (const marker of PASSIVE_MARKERS) {
    const re = new RegExp(`\\b${marker}\\b`, "g");
    passiveHits += (lower.match(re) || []).length;
  }
  // Also catch "was/were/been/being + -ed word"
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
