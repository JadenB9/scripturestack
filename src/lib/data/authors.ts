/**
 * Seven NT author profiles with handcrafted stylometric fingerprints.
 * The metrics are approximate, derived from published analyses of the
 * Greek text, and are used by the radar charts on /analytics/authorship.
 *
 * Each value is normalized 0–1 so the radar charts are directly comparable.
 */

export type AuthorProfile = {
  id: string;
  name: string;
  books: string[];
  metrics: {
    sentenceLength: number;     // average sentence length
    vocabRichness: number;      // type-token ratio
    questionFrequency: number;  // rhetorical questions per 1000 words
    imperativeFrequency: number;// imperatives per 1000 words
    otQuotations: number;       // OT citations per 1000 words
    passiveVoice: number;       // passive verbs per 1000 words
  };
  signature: string;
};

export const AUTHORS: AuthorProfile[] = [
  {
    id: "paul",
    name: "Paul",
    books: ["Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon"],
    metrics: { sentenceLength: 0.78, vocabRichness: 0.72, questionFrequency: 0.92, imperativeFrequency: 0.74, otQuotations: 0.88, passiveVoice: 0.66 },
    signature: "Long, logic-driven sentences. Frequent rhetorical questions. Dense Old Testament citation. Imperatives clustered in the second half of each letter.",
  },
  {
    id: "john",
    name: "John",
    books: ["John", "1 John", "2 John", "3 John", "Revelation"],
    metrics: { sentenceLength: 0.42, vocabRichness: 0.38, questionFrequency: 0.48, imperativeFrequency: 0.56, otQuotations: 0.62, passiveVoice: 0.52 },
    signature: "Short sentences. Intentionally small vocabulary with theological depth. Heavy on dualism (light/dark, truth/lie, love/hate).",
  },
  {
    id: "luke",
    name: "Luke",
    books: ["Luke", "Acts"],
    metrics: { sentenceLength: 0.94, vocabRichness: 0.88, questionFrequency: 0.38, imperativeFrequency: 0.32, otQuotations: 0.56, passiveVoice: 0.71 },
    signature: "The most polished literary Greek in the NT. Longest sentences, richest vocabulary, periodic historical prologues.",
  },
  {
    id: "peter",
    name: "Peter",
    books: ["1 Peter", "2 Peter"],
    metrics: { sentenceLength: 0.62, vocabRichness: 0.68, questionFrequency: 0.36, imperativeFrequency: 0.82, otQuotations: 0.78, passiveVoice: 0.55 },
    signature: "Moderate sentences, high imperative density (practical exhortation), strong OT grounding.",
  },
  {
    id: "matthew",
    name: "Matthew",
    books: ["Matthew"],
    metrics: { sentenceLength: 0.58, vocabRichness: 0.56, questionFrequency: 0.44, imperativeFrequency: 0.48, otQuotations: 0.96, passiveVoice: 0.52 },
    signature: "The highest OT quotation density in the NT — 'that it might be fulfilled.' Organized around five discourses.",
  },
  {
    id: "mark",
    name: "Mark",
    books: ["Mark"],
    metrics: { sentenceLength: 0.36, vocabRichness: 0.44, questionFrequency: 0.32, imperativeFrequency: 0.38, otQuotations: 0.48, passiveVoice: 0.42 },
    signature: "Short sentences, rapid action, frequent use of 'immediately' (euthys). The shortest vocabulary of the Gospels.",
  },
  {
    id: "james",
    name: "James",
    books: ["James"],
    metrics: { sentenceLength: 0.48, vocabRichness: 0.64, questionFrequency: 0.58, imperativeFrequency: 0.94, otQuotations: 0.58, passiveVoice: 0.46 },
    signature: "Highest imperative density in the NT — nearly one command per two verses. Proverbial, wisdom-literature style.",
  },
];

export const RADAR_AXES: Array<{ key: keyof AuthorProfile["metrics"]; label: string }> = [
  { key: "sentenceLength", label: "Sentence length" },
  { key: "vocabRichness", label: "Vocab richness" },
  { key: "questionFrequency", label: "Questions" },
  { key: "imperativeFrequency", label: "Imperatives" },
  { key: "otQuotations", label: "OT quotes" },
  { key: "passiveVoice", label: "Passive voice" },
];
