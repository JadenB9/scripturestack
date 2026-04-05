/**
 * Manuscript metadata + representative textual variants. Covers the five
 * manuscripts every Bible student should know, and the handful of variants
 * that matter for Bible study (not exhaustive).
 */

export type Manuscript = {
  id: string;
  name: string;
  dateRange: string;
  description: string;
  locationToday: string;
  digitizationUrl: string;
  language: string;
  contains: string;
};

export const MANUSCRIPTS: Manuscript[] = [
  {
    id: "dss",
    name: "Dead Sea Scrolls",
    dateRange: "c. 250 BC – AD 68",
    description:
      "A cache of roughly 900 scrolls discovered in caves near Qumran beginning in 1947. The Great Isaiah Scroll (1QIsaᵃ) is the oldest near-complete biblical manuscript known, pushing the witness to the Hebrew Scriptures back a thousand years earlier than the medieval Masoretic codices.",
    locationToday: "Israel Museum, Jerusalem (Shrine of the Book) and partner institutions",
    digitizationUrl: "https://www.deadseascrolls.org.il",
    language: "Hebrew, Aramaic, Greek",
    contains: "Portions of every OT book except Esther",
  },
  {
    id: "sinaiticus",
    name: "Codex Sinaiticus",
    dateRange: "c. AD 330–360",
    description:
      "A hand-written copy of the Christian Bible, in Greek, produced in the mid-fourth century. Sinaiticus contains the whole New Testament along with large portions of the Old Testament. It is the oldest complete copy of the Greek New Testament in existence.",
    locationToday: "British Library (primary); Leipzig University; Saint Catherine's Monastery; National Library of Russia",
    digitizationUrl: "https://codexsinaiticus.org",
    language: "Koine Greek",
    contains: "Complete Greek New Testament + most of the Septuagint",
  },
  {
    id: "vaticanus",
    name: "Codex Vaticanus",
    dateRange: "c. AD 300–325",
    description:
      "One of the oldest extant manuscripts of the Greek Bible. Its text is closely related to that of Sinaiticus and together they represent the Alexandrian text type that underlies most modern critical editions of the New Testament.",
    locationToday: "Vatican Apostolic Library, Vatican City",
    digitizationUrl: "https://digi.vatlib.it/view/MSS_Vat.gr.1209",
    language: "Koine Greek",
    contains: "Most of the Old and New Testaments",
  },
  {
    id: "masoretic",
    name: "Masoretic Text (Leningrad Codex)",
    dateRange: "AD 1008",
    description:
      "The oldest complete manuscript of the Hebrew Bible. Produced by the Masoretes, Jewish scribes who preserved the consonantal text and added vowel pointing, cantillation marks, and marginal notes. The Leningrad Codex is the base text for the Biblia Hebraica Stuttgartensia used by Hebrew scholars today.",
    locationToday: "Russian National Library, Saint Petersburg",
    digitizationUrl: "https://archive.org/details/Leningrad_Codex",
    language: "Hebrew (with Masoretic vowel pointing)",
    contains: "Complete Hebrew Old Testament",
  },
  {
    id: "textus-receptus",
    name: "Textus Receptus",
    dateRange: "AD 1516 (Erasmus) – 1633 (Elzevir)",
    description:
      "The printed Greek New Testament that underlay the Reformation-era translations including Tyndale, the Geneva Bible, and the King James Version. Compiled from late medieval Byzantine manuscripts, it became the received text of Protestantism for 300 years before being displaced in scholarly use by critical editions drawn from older manuscripts.",
    locationToday: "Printed — first edition by Erasmus, 1516",
    digitizationUrl: "https://archive.org/details/TextusReceptus",
    language: "Koine Greek",
    contains: "Complete Greek New Testament",
  },
];

export type VariantSignificance = "minor" | "moderate" | "significant";

export type TextualVariant = {
  id: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
  passage: string;
  significance: VariantSignificance;
  readings: Array<{ label: string; text: string; witnesses: string[] }>;
  note: string;
};

export const VARIANTS: TextualVariant[] = [
  {
    id: "mark-16-long-ending",
    book: "Mark",
    chapter: 16,
    verseStart: 9,
    verseEnd: 20,
    passage: "Mark 16:9–20",
    significance: "significant",
    readings: [
      {
        label: "Long ending (included)",
        text: "The twelve verses recounting post-resurrection appearances, signs accompanying believers, and the ascension.",
        witnesses: ["Textus Receptus", "Majority of later manuscripts", "A, C, D, W"],
      },
      {
        label: "Short ending / omitted",
        text: "The gospel ends at 16:8 with the women fleeing from the empty tomb in fear.",
        witnesses: ["Codex Sinaiticus", "Codex Vaticanus", "Old Latin k", "Old Syriac Sinaiticus"],
      },
    ],
    note:
      "The two oldest Greek manuscripts (Sinaiticus, Vaticanus) end Mark at 16:8. Most modern translations include the long ending with a note indicating its disputed status. The theology of the verses is consistent with the rest of Scripture; the question is whether Mark himself wrote them.",
  },
  {
    id: "john-pericope-adulterae",
    book: "John",
    chapter: 7,
    verseStart: 53,
    verseEnd: 8,
    passage: "John 7:53–8:11",
    significance: "significant",
    readings: [
      {
        label: "Included",
        text: "The story of the woman caught in adultery: 'Let him who is without sin among you be the first to throw a stone at her.'",
        witnesses: ["Textus Receptus", "Codex Bezae (D)", "Vulgate", "most later manuscripts"],
      },
      {
        label: "Omitted",
        text: "Jesus' discourse at the Feast of Tabernacles moves directly from 7:52 to 8:12 without interruption.",
        witnesses: ["Codex Sinaiticus", "Codex Vaticanus", "Papyrus 66", "Papyrus 75"],
      },
    ],
    note:
      "Absent from the earliest and most reliable manuscripts and from many Greek manuscripts that do include it, but found in different locations (after Luke 21:38, after John 7:36, at the end of John). Modern editions typically bracket the passage while noting its ancient provenance.",
  },
  {
    id: "1john-5-7-comma",
    book: "1 John",
    chapter: 5,
    verseStart: 7,
    verseEnd: 8,
    passage: "1 John 5:7–8 (the Comma Johanneum)",
    significance: "significant",
    readings: [
      {
        label: "With Trinitarian phrase",
        text: "'For there are three that bear record in heaven, the Father, the Word, and the Holy Ghost: and these three are one.'",
        witnesses: ["A handful of very late Latin manuscripts", "Textus Receptus", "KJV"],
      },
      {
        label: "Without",
        text: "'For there are three that testify: the Spirit and the water and the blood; and these three agree.'",
        witnesses: ["All Greek manuscripts before the 14th century", "Sinaiticus", "Vaticanus", "Alexandrinus"],
      },
    ],
    note:
      "The Comma Johanneum entered the Greek tradition via Erasmus's third edition (1522), reportedly under pressure after critics pointed to its presence in the Latin Vulgate. The doctrine of the Trinity does not rest on this verse — it is taught throughout the New Testament.",
  },
  {
    id: "matt-6-13-doxology",
    book: "Matthew",
    chapter: 6,
    verseStart: 13,
    passage: "Matthew 6:13 (end of the Lord's Prayer)",
    significance: "moderate",
    readings: [
      {
        label: "With doxology",
        text: "'For thine is the kingdom, and the power, and the glory, forever. Amen.'",
        witnesses: ["Most later Byzantine manuscripts", "Textus Receptus", "KJV", "Didache"],
      },
      {
        label: "Without",
        text: "The prayer ends 'but deliver us from the evil one.'",
        witnesses: ["Sinaiticus", "Vaticanus", "Bezae", "Old Latin"],
      },
    ],
    note:
      "The doxology is almost certainly a very ancient liturgical addition — it appears in the Didache (a first-century church manual) and became standard in Greek liturgy. Modern translations typically omit it from the main text and include a footnote.",
  },
  {
    id: "rom-8-1",
    book: "Romans",
    chapter: 8,
    verseStart: 1,
    passage: "Romans 8:1",
    significance: "minor",
    readings: [
      {
        label: "Short reading",
        text: "'There is therefore now no condemnation for those who are in Christ Jesus.'",
        witnesses: ["Sinaiticus", "Vaticanus", "most modern editions"],
      },
      {
        label: "Long reading",
        text: "'… who walk not after the flesh, but after the Spirit.'",
        witnesses: ["Textus Receptus", "Majority Text", "KJV"],
      },
    ],
    note:
      "The longer reading appears to have been imported from Romans 8:4 to clarify who 'those in Christ Jesus' are. The shorter, unconditional reading is better attested and more forceful.",
  },
  {
    id: "acts-8-37",
    book: "Acts",
    chapter: 8,
    verseStart: 37,
    passage: "Acts 8:37 (Philip and the Ethiopian)",
    significance: "moderate",
    readings: [
      {
        label: "Included",
        text: "'If thou believest with all thine heart, thou mayest. And he answered and said, I believe that Jesus Christ is the Son of God.'",
        witnesses: ["Codex Laudianus", "some Latin manuscripts", "Textus Receptus"],
      },
      {
        label: "Omitted",
        text: "The narrative moves directly from 8:36 to 8:38 — Philip baptizes the eunuch without a recorded confession.",
        witnesses: ["Papyrus 45", "Papyrus 74", "Sinaiticus", "Vaticanus", "most modern editions"],
      },
    ],
    note:
      "A beloved verse for baptismal confession traditions, but absent from nearly all early manuscripts. Likely a second-century addition reflecting early church practice.",
  },
  {
    id: "luke-22-43-44",
    book: "Luke",
    chapter: 22,
    verseStart: 43,
    verseEnd: 44,
    passage: "Luke 22:43–44 (Gethsemane — the angel and bloody sweat)",
    significance: "moderate",
    readings: [
      {
        label: "Included",
        text: "'And there appeared an angel unto him from heaven, strengthening him. And being in an agony he prayed more earnestly: and his sweat was as it were great drops of blood falling down to the ground.'",
        witnesses: ["Sinaiticus (original)", "Bezae", "Justin Martyr", "Irenaeus"],
      },
      {
        label: "Omitted",
        text: "Luke's Gethsemane account omits these verses.",
        witnesses: ["Papyrus 75", "Vaticanus", "Alexandrinus"],
      },
    ],
    note:
      "The external evidence is genuinely divided. The verses were known in the second century but are absent from major Alexandrian witnesses. Most modern translations include them with a footnote.",
  },
];
