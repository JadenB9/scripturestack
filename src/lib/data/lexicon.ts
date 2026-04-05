/**
 * Hand-curated lexicon stubs for frequent biblical Hebrew and Greek words.
 * A real production build would wire this into a Strong's / BDAG API; this
 * static set covers the words most readers look up and powers the lexicon
 * popover, word hover, and /lexicon/[strongsNumber] pages.
 */

export type Language = "Hebrew" | "Greek";

export type LexiconEntry = {
  strongs: string;       // e.g. "G26" or "H430"
  lemma: string;         // original script
  transliteration: string;
  language: Language;
  partOfSpeech: string;
  shortDefinition: string;
  longDefinition: string;
  // English surface forms (lowercased) that we'll match in verse text.
  surface: string[];
};

export const LEXICON: LexiconEntry[] = [
  {
    strongs: "H430",
    lemma: "אֱלֹהִים",
    transliteration: "elohim",
    language: "Hebrew",
    partOfSpeech: "Noun, masculine plural",
    shortDefinition: "God; gods; rulers, judges; divine ones; angels.",
    longDefinition:
      "A plural of majesty for the true God when used of Israel's LORD, denoting His supreme greatness and the fullness of His being. Also used for false gods, angels, and human judges where the context demands.",
    surface: ["god", "gods"],
  },
  {
    strongs: "H3068",
    lemma: "יְהוָה",
    transliteration: "YHWH",
    language: "Hebrew",
    partOfSpeech: "Proper noun",
    shortDefinition: "The LORD — the covenant name of the God of Israel.",
    longDefinition:
      "The self-revealed, personal name of God, often vocalized as Yahweh. It is derived from the verb 'to be' and points to God's self-existence and unchanging faithfulness. Translated LORD (small caps) in most English Bibles.",
    surface: ["lord"],
  },
  {
    strongs: "H2617",
    lemma: "חֶסֶד",
    transliteration: "chesed",
    language: "Hebrew",
    partOfSpeech: "Noun, masculine",
    shortDefinition: "Steadfast love, covenant faithfulness, loyal kindness.",
    longDefinition:
      "One of the richest theological words in the Old Testament. It describes the loyal love God owes to no one yet freely gives to His covenant people. Often translated 'steadfast love,' 'mercy,' or 'lovingkindness.'",
    surface: ["steadfast", "mercy", "lovingkindness", "kindness"],
  },
  {
    strongs: "H7307",
    lemma: "רוּחַ",
    transliteration: "ruach",
    language: "Hebrew",
    partOfSpeech: "Noun, feminine",
    shortDefinition: "Wind, breath, spirit; the Spirit of God.",
    longDefinition:
      "A flexible noun covering the visible moving wind, the breath of a living being, and the invisible Spirit of God who hovers over the waters, empowers prophets, and breathes life into dry bones.",
    surface: ["spirit", "breath", "wind"],
  },
  {
    strongs: "H6662",
    lemma: "צַדִּיק",
    transliteration: "tsaddiq",
    language: "Hebrew",
    partOfSpeech: "Adjective",
    shortDefinition: "Righteous, just, one who lives rightly.",
    longDefinition:
      "Describes a person or action that conforms to God's righteous standard. The righteous are contrasted with the wicked throughout the Psalms and Proverbs.",
    surface: ["righteous", "just"],
  },
  {
    strongs: "H1288",
    lemma: "בָּרַךְ",
    transliteration: "barak",
    language: "Hebrew",
    partOfSpeech: "Verb",
    shortDefinition: "To kneel, to bless; to salute, to praise.",
    longDefinition:
      "To invoke blessing, to bestow good, or to kneel in acknowledgment. Used of God blessing people, people blessing God (as praise), and blessing one another.",
    surface: ["bless", "blessed", "blessing"],
  },
  {
    strongs: "H539",
    lemma: "אָמַן",
    transliteration: "aman",
    language: "Hebrew",
    partOfSpeech: "Verb",
    shortDefinition: "To confirm, to support, to trust, to believe.",
    longDefinition:
      "The root of the word 'amen.' To be firm, to stand fast, to rely upon. Abraham 'believed' the LORD and it was counted to him as righteousness (Gen 15:6).",
    surface: ["believe", "believed", "trust"],
  },
  {
    strongs: "H3467",
    lemma: "יָשַׁע",
    transliteration: "yasha",
    language: "Hebrew",
    partOfSpeech: "Verb",
    shortDefinition: "To save, deliver, give victory.",
    longDefinition:
      "The verbal root behind the names Joshua and Jesus (Yeshua). To bring someone out of a tight place into an open one — rescue, salvation, victory.",
    surface: ["save", "saved", "deliver", "delivered"],
  },
  {
    strongs: "G26",
    lemma: "ἀγάπη",
    transliteration: "agape",
    language: "Greek",
    partOfSpeech: "Noun, feminine",
    shortDefinition: "Love — the self-giving love of God.",
    longDefinition:
      "The love that chooses the good of the other without regard for reciprocation. The love with which the Father loves the Son, with which God loves the world, and which is poured into the hearts of believers by the Holy Spirit.",
    surface: ["love", "loved", "loves"],
  },
  {
    strongs: "G5485",
    lemma: "χάρις",
    transliteration: "charis",
    language: "Greek",
    partOfSpeech: "Noun, feminine",
    shortDefinition: "Grace, favor, kindness freely given.",
    longDefinition:
      "Undeserved kindness — especially God's unmerited favor toward sinners in Christ. The characteristic Pauline word for the gospel, paired often with peace in epistolary greetings.",
    surface: ["grace"],
  },
  {
    strongs: "G4102",
    lemma: "πίστις",
    transliteration: "pistis",
    language: "Greek",
    partOfSpeech: "Noun, feminine",
    shortDefinition: "Faith, trust, belief; faithfulness.",
    longDefinition:
      "Both the act of believing and the settled state of trust in God. Also carries the sense of faithfulness — God's covenant faithfulness that calls forth our faith.",
    surface: ["faith"],
  },
  {
    strongs: "G3056",
    lemma: "λόγος",
    transliteration: "logos",
    language: "Greek",
    partOfSpeech: "Noun, masculine",
    shortDefinition: "Word, message, reason, statement.",
    longDefinition:
      "A spoken or written word, a statement, a message. John's prologue gives logos a cosmic scope: the eternal Word who was with God, who was God, who became flesh and dwelt among us.",
    surface: ["word", "words"],
  },
  {
    strongs: "G2316",
    lemma: "θεός",
    transliteration: "theos",
    language: "Greek",
    partOfSpeech: "Noun, masculine",
    shortDefinition: "God — deity; the one true God.",
    longDefinition:
      "The generic Greek word for deity that the New Testament writers reclaim to speak of the God and Father of our Lord Jesus Christ.",
    surface: ["god"],
  },
  {
    strongs: "G2962",
    lemma: "κύριος",
    transliteration: "kyrios",
    language: "Greek",
    partOfSpeech: "Noun, masculine",
    shortDefinition: "Lord, master, owner; the LORD.",
    longDefinition:
      "Used in the Septuagint to translate YHWH, and in the New Testament applied to Jesus — a high christological confession: 'Jesus is Lord.'",
    surface: ["lord"],
  },
  {
    strongs: "G5547",
    lemma: "Χριστός",
    transliteration: "Christos",
    language: "Greek",
    partOfSpeech: "Noun, masculine",
    shortDefinition: "Christ, the Anointed One; Messiah.",
    longDefinition:
      "The Greek translation of the Hebrew Mashiach. The anointed Prophet, Priest, and King promised throughout the Old Testament and fulfilled in Jesus of Nazareth.",
    surface: ["christ"],
  },
  {
    strongs: "G4151",
    lemma: "πνεῦμα",
    transliteration: "pneuma",
    language: "Greek",
    partOfSpeech: "Noun, neuter",
    shortDefinition: "Spirit, wind, breath; the Holy Spirit.",
    longDefinition:
      "Parallel to the Hebrew ruach. The New Testament uses pneuma for the Holy Spirit poured out at Pentecost, for the human spirit, for wind, and for spiritual beings good and evil.",
    surface: ["spirit"],
  },
  {
    strongs: "G932",
    lemma: "βασιλεία",
    transliteration: "basileia",
    language: "Greek",
    partOfSpeech: "Noun, feminine",
    shortDefinition: "Kingdom, reign, rule.",
    longDefinition:
      "The dynamic reign of God that Jesus announced as being at hand — a kingdom already here in Him and yet to be fully consummated at His return.",
    surface: ["kingdom"],
  },
  {
    strongs: "G266",
    lemma: "ἁμαρτία",
    transliteration: "hamartia",
    language: "Greek",
    partOfSpeech: "Noun, feminine",
    shortDefinition: "Sin, missing the mark, wrongdoing.",
    longDefinition:
      "To miss the mark — any failure to conform to God's righteous will, in thought, word, or deed. Paul treats sin as a power that enslaves until broken by Christ.",
    surface: ["sin", "sins"],
  },
  {
    strongs: "G5207",
    lemma: "υἱός",
    transliteration: "huios",
    language: "Greek",
    partOfSpeech: "Noun, masculine",
    shortDefinition: "Son; descendant; follower.",
    longDefinition:
      "A son by birth or by adoption. Key to the NT use of 'Son of God' (divine sonship of Jesus) and 'Son of Man' (Daniel 7 messianic title).",
    surface: ["son"],
  },
  {
    strongs: "G1343",
    lemma: "δικαιοσύνη",
    transliteration: "dikaiosyne",
    language: "Greek",
    partOfSpeech: "Noun, feminine",
    shortDefinition: "Righteousness, justice, right standing.",
    longDefinition:
      "The state of being right with God — both the moral quality and the forensic verdict declared over those who are in Christ by faith.",
    surface: ["righteousness"],
  },
  {
    strongs: "G1515",
    lemma: "εἰρήνη",
    transliteration: "eirene",
    language: "Greek",
    partOfSpeech: "Noun, feminine",
    shortDefinition: "Peace, well-being, wholeness.",
    longDefinition:
      "The Greek counterpart to the Hebrew shalom — not merely the absence of conflict but the full flourishing of life before God and with others.",
    surface: ["peace"],
  },
];

export const LEXICON_BY_STRONGS = new Map(LEXICON.map((l) => [l.strongs, l]));

/** Case-insensitive word lookup — used by the verse word hover. */
export function lookupWord(word: string): LexiconEntry | null {
  const w = word.toLowerCase().replace(/[^a-z'-]/g, "");
  if (!w) return null;
  for (const entry of LEXICON) {
    if (entry.surface.includes(w)) return entry;
  }
  return null;
}
