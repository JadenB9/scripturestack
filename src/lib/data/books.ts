/**
 * Canonical metadata for the 66 books of the Protestant Bible.
 *
 * Chapter counts are authoritative (used for navigation bounds).
 * Author, date, genre, key theme are scholarly consensus — used for
 * the Books grid and command palette.
 */

export type Testament = "OT" | "NT";
export type Genre =
  | "Law"
  | "History"
  | "Poetry"
  | "Wisdom"
  | "Prophecy"
  | "Gospel"
  | "Epistle"
  | "Apocalyptic";

export interface BookMeta {
  name: string;
  abbr: string;
  testament: Testament;
  genre: Genre;
  chapters: number;
  verses: number;
  author: string;
  dateWritten: string;
  theme: string;
}

export const BOOKS: BookMeta[] = [
  { name: "Genesis", abbr: "Gen", testament: "OT", genre: "Law", chapters: 50, verses: 1533, author: "Moses", dateWritten: "c. 1440–1400 BC", theme: "Beginnings — creation, fall, and the covenant-making God who calls a people through Abraham." },
  { name: "Exodus", abbr: "Exo", testament: "OT", genre: "Law", chapters: 40, verses: 1213, author: "Moses", dateWritten: "c. 1440–1400 BC", theme: "Redemption out of Egypt, the giving of the Law at Sinai, and God's dwelling presence in the tabernacle." },
  { name: "Leviticus", abbr: "Lev", testament: "OT", genre: "Law", chapters: 27, verses: 859, author: "Moses", dateWritten: "c. 1440 BC", theme: "Holiness code — how a redeemed people approaches a holy God through sacrifice and purity." },
  { name: "Numbers", abbr: "Num", testament: "OT", genre: "Law", chapters: 36, verses: 1288, author: "Moses", dateWritten: "c. 1440–1400 BC", theme: "Wilderness wandering — faithlessness, discipline, and the faithfulness of God across a generation." },
  { name: "Deuteronomy", abbr: "Deut", testament: "OT", genre: "Law", chapters: 34, verses: 959, author: "Moses", dateWritten: "c. 1406 BC", theme: "Covenant renewal on the edge of the Promised Land — remember, obey, love the LORD." },
  { name: "Joshua", abbr: "Josh", testament: "OT", genre: "History", chapters: 24, verses: 658, author: "Joshua / later editors", dateWritten: "c. 1400 BC", theme: "Conquest and inheritance — the LORD gives the land He promised." },
  { name: "Judges", abbr: "Jdg", testament: "OT", genre: "History", chapters: 21, verses: 618, author: "Samuel (tradition)", dateWritten: "c. 1050 BC", theme: "Cycles of apostasy and deliverance — 'there was no king in Israel, and everyone did what was right in his own eyes.'" },
  { name: "Ruth", abbr: "Rth", testament: "OT", genre: "History", chapters: 4, verses: 85, author: "Unknown", dateWritten: "c. 1000 BC", theme: "Covenant loyalty in the dark — a Moabite widow becomes the great-grandmother of David." },
  { name: "1 Samuel", abbr: "1Sa", testament: "OT", genre: "History", chapters: 31, verses: 810, author: "Samuel / prophets", dateWritten: "c. 930 BC", theme: "From judges to kingship — Samuel, Saul, and the rise of David." },
  { name: "2 Samuel", abbr: "2Sa", testament: "OT", genre: "History", chapters: 24, verses: 695, author: "Samuel / prophets", dateWritten: "c. 930 BC", theme: "David's reign — the Davidic covenant, sin, and its long consequences." },
  { name: "1 Kings", abbr: "1Ki", testament: "OT", genre: "History", chapters: 22, verses: 816, author: "Unknown (prophetic)", dateWritten: "c. 560 BC", theme: "Solomon's glory, the divided kingdom, and the ministry of Elijah." },
  { name: "2 Kings", abbr: "2Ki", testament: "OT", genre: "History", chapters: 25, verses: 719, author: "Unknown (prophetic)", dateWritten: "c. 560 BC", theme: "The long decline of Israel and Judah and the exile to Babylon." },
  { name: "1 Chronicles", abbr: "1Ch", testament: "OT", genre: "History", chapters: 29, verses: 942, author: "Ezra (tradition)", dateWritten: "c. 450 BC", theme: "A priestly retelling of David's reign for the post-exilic community." },
  { name: "2 Chronicles", abbr: "2Ch", testament: "OT", genre: "History", chapters: 36, verses: 822, author: "Ezra (tradition)", dateWritten: "c. 450 BC", theme: "The kings of Judah and the centrality of the temple." },
  { name: "Ezra", abbr: "Ezr", testament: "OT", genre: "History", chapters: 10, verses: 280, author: "Ezra", dateWritten: "c. 450 BC", theme: "Return from exile, rebuilding the temple, and restoring the Law." },
  { name: "Nehemiah", abbr: "Neh", testament: "OT", genre: "History", chapters: 13, verses: 406, author: "Nehemiah", dateWritten: "c. 430 BC", theme: "Rebuilding the walls of Jerusalem and reforming the covenant community." },
  { name: "Esther", abbr: "Est", testament: "OT", genre: "History", chapters: 10, verses: 167, author: "Unknown", dateWritten: "c. 460 BC", theme: "Providence in exile — God preserves His people even when He is not named." },
  { name: "Job", abbr: "Job", testament: "OT", genre: "Wisdom", chapters: 42, verses: 1070, author: "Unknown", dateWritten: "Patriarchal era", theme: "Suffering, the limits of human wisdom, and the sovereignty of God." },
  { name: "Psalms", abbr: "Psa", testament: "OT", genre: "Poetry", chapters: 150, verses: 2461, author: "David and others", dateWritten: "c. 1440–430 BC", theme: "The prayer book of God's people — lament, praise, confession, and trust." },
  { name: "Proverbs", abbr: "Pro", testament: "OT", genre: "Wisdom", chapters: 31, verses: 915, author: "Solomon and others", dateWritten: "c. 950–700 BC", theme: "The fear of the LORD is the beginning of wisdom." },
  { name: "Ecclesiastes", abbr: "Ecc", testament: "OT", genre: "Wisdom", chapters: 12, verses: 222, author: "Solomon (tradition)", dateWritten: "c. 935 BC", theme: "Life 'under the sun' without God is vanity; fear God and keep His commandments." },
  { name: "Song of Solomon", abbr: "Sng", testament: "OT", genre: "Poetry", chapters: 8, verses: 117, author: "Solomon", dateWritten: "c. 965 BC", theme: "Love — the goodness of covenant love, and a picture of Christ and the Church." },
  { name: "Isaiah", abbr: "Isa", testament: "OT", genre: "Prophecy", chapters: 66, verses: 1292, author: "Isaiah", dateWritten: "c. 740–680 BC", theme: "The holy One of Israel — judgment, comfort, and the suffering Servant." },
  { name: "Jeremiah", abbr: "Jer", testament: "OT", genre: "Prophecy", chapters: 52, verses: 1364, author: "Jeremiah", dateWritten: "c. 627–580 BC", theme: "The weeping prophet — warning, exile, and the promise of a new covenant." },
  { name: "Lamentations", abbr: "Lam", testament: "OT", genre: "Poetry", chapters: 5, verses: 154, author: "Jeremiah (tradition)", dateWritten: "c. 586 BC", theme: "Grief over the fall of Jerusalem — yet His mercies are new every morning." },
  { name: "Ezekiel", abbr: "Ezk", testament: "OT", genre: "Prophecy", chapters: 48, verses: 1273, author: "Ezekiel", dateWritten: "c. 593–571 BC", theme: "The glory of the LORD departs and returns — dry bones live again." },
  { name: "Daniel", abbr: "Dan", testament: "OT", genre: "Apocalyptic", chapters: 12, verses: 357, author: "Daniel", dateWritten: "c. 605–530 BC", theme: "God is sovereign over the kingdoms of men and gives His kingdom to the Son of Man." },
  { name: "Hosea", abbr: "Hos", testament: "OT", genre: "Prophecy", chapters: 14, verses: 197, author: "Hosea", dateWritten: "c. 750–715 BC", theme: "A prophet's marriage pictures God's steadfast love for an unfaithful people." },
  { name: "Joel", abbr: "Jol", testament: "OT", genre: "Prophecy", chapters: 3, verses: 73, author: "Joel", dateWritten: "c. 835 BC (disputed)", theme: "The day of the LORD is near — rend your hearts, and I will pour out my Spirit." },
  { name: "Amos", abbr: "Amo", testament: "OT", genre: "Prophecy", chapters: 9, verses: 146, author: "Amos", dateWritten: "c. 760 BC", theme: "Let justice roll down like waters, and righteousness like an ever-flowing stream." },
  { name: "Obadiah", abbr: "Oba", testament: "OT", genre: "Prophecy", chapters: 1, verses: 21, author: "Obadiah", dateWritten: "c. 586 BC", theme: "Judgment on Edom and the sure kingdom of the LORD." },
  { name: "Jonah", abbr: "Jon", testament: "OT", genre: "Prophecy", chapters: 4, verses: 48, author: "Jonah", dateWritten: "c. 780 BC", theme: "God's mercy reaches the nations, even against the prophet's will." },
  { name: "Micah", abbr: "Mic", testament: "OT", genre: "Prophecy", chapters: 7, verses: 105, author: "Micah", dateWritten: "c. 735–700 BC", theme: "Do justice, love mercy, walk humbly with your God — a ruler comes from Bethlehem." },
  { name: "Nahum", abbr: "Nah", testament: "OT", genre: "Prophecy", chapters: 3, verses: 47, author: "Nahum", dateWritten: "c. 650 BC", theme: "The fall of Nineveh — the LORD is slow to anger, but He will not leave the guilty unpunished." },
  { name: "Habakkuk", abbr: "Hab", testament: "OT", genre: "Prophecy", chapters: 3, verses: 56, author: "Habakkuk", dateWritten: "c. 605 BC", theme: "The righteous shall live by faith — wrestling with God and learning to trust." },
  { name: "Zephaniah", abbr: "Zep", testament: "OT", genre: "Prophecy", chapters: 3, verses: 53, author: "Zephaniah", dateWritten: "c. 625 BC", theme: "The day of the LORD and the singing joy of a remnant gathered home." },
  { name: "Haggai", abbr: "Hag", testament: "OT", genre: "Prophecy", chapters: 2, verses: 38, author: "Haggai", dateWritten: "c. 520 BC", theme: "Rebuild the house of the LORD — consider your ways." },
  { name: "Zechariah", abbr: "Zec", testament: "OT", genre: "Prophecy", chapters: 14, verses: 211, author: "Zechariah", dateWritten: "c. 520–480 BC", theme: "Visions of the coming King — humble, pierced, reigning." },
  { name: "Malachi", abbr: "Mal", testament: "OT", genre: "Prophecy", chapters: 4, verses: 55, author: "Malachi", dateWritten: "c. 430 BC", theme: "A messenger is coming — return to the LORD, and He will return to you." },
  { name: "Matthew", abbr: "Mat", testament: "NT", genre: "Gospel", chapters: 28, verses: 1071, author: "Matthew (Levi)", dateWritten: "c. AD 60", theme: "Jesus as the promised Messiah-King who fulfills the Law and the Prophets." },
  { name: "Mark", abbr: "Mrk", testament: "NT", genre: "Gospel", chapters: 16, verses: 678, author: "John Mark", dateWritten: "c. AD 55–65", theme: "Jesus the suffering Servant — immediate action, a cross, an empty tomb." },
  { name: "Luke", abbr: "Luk", testament: "NT", genre: "Gospel", chapters: 24, verses: 1151, author: "Luke the physician", dateWritten: "c. AD 60–62", theme: "Jesus as the Son of Man — Savior of the lost, friend of outsiders." },
  { name: "John", abbr: "Jhn", testament: "NT", genre: "Gospel", chapters: 21, verses: 879, author: "John the apostle", dateWritten: "c. AD 85–95", theme: "Jesus as the eternal Word made flesh — believe and have life in His name." },
  { name: "Acts", abbr: "Act", testament: "NT", genre: "History", chapters: 28, verses: 1007, author: "Luke", dateWritten: "c. AD 62", theme: "The gospel goes from Jerusalem to Rome by the power of the Holy Spirit." },
  { name: "Romans", abbr: "Rom", testament: "NT", genre: "Epistle", chapters: 16, verses: 433, author: "Paul", dateWritten: "c. AD 57", theme: "The gospel of God — righteousness by faith for Jew and Gentile alike." },
  { name: "1 Corinthians", abbr: "1Co", testament: "NT", genre: "Epistle", chapters: 16, verses: 437, author: "Paul", dateWritten: "c. AD 55", theme: "The cross, the church, and love that never ends." },
  { name: "2 Corinthians", abbr: "2Co", testament: "NT", genre: "Epistle", chapters: 13, verses: 257, author: "Paul", dateWritten: "c. AD 56", theme: "Ministry in weakness — power made perfect in human frailty." },
  { name: "Galatians", abbr: "Gal", testament: "NT", genre: "Epistle", chapters: 6, verses: 149, author: "Paul", dateWritten: "c. AD 49", theme: "Justification by faith alone, not by the works of the Law." },
  { name: "Ephesians", abbr: "Eph", testament: "NT", genre: "Epistle", chapters: 6, verses: 155, author: "Paul", dateWritten: "c. AD 60", theme: "One new humanity in Christ — chosen, redeemed, seated in the heavenlies." },
  { name: "Philippians", abbr: "Php", testament: "NT", genre: "Epistle", chapters: 4, verses: 104, author: "Paul", dateWritten: "c. AD 61", theme: "Joy in Christ — He who began a good work will bring it to completion." },
  { name: "Colossians", abbr: "Col", testament: "NT", genre: "Epistle", chapters: 4, verses: 95, author: "Paul", dateWritten: "c. AD 60", theme: "The supremacy of Christ over all things." },
  { name: "1 Thessalonians", abbr: "1Th", testament: "NT", genre: "Epistle", chapters: 5, verses: 89, author: "Paul", dateWritten: "c. AD 51", theme: "Hope in the return of the Lord and the comfort of saints not yet gone." },
  { name: "2 Thessalonians", abbr: "2Th", testament: "NT", genre: "Epistle", chapters: 3, verses: 47, author: "Paul", dateWritten: "c. AD 51", theme: "Stand firm until the day of the Lord — work, wait, and worship." },
  { name: "1 Timothy", abbr: "1Ti", testament: "NT", genre: "Epistle", chapters: 6, verses: 113, author: "Paul", dateWritten: "c. AD 63", theme: "How one ought to behave in the household of God, the pillar of truth." },
  { name: "2 Timothy", abbr: "2Ti", testament: "NT", genre: "Epistle", chapters: 4, verses: 83, author: "Paul", dateWritten: "c. AD 67", theme: "I have fought the good fight — guard the good deposit." },
  { name: "Titus", abbr: "Tit", testament: "NT", genre: "Epistle", chapters: 3, verses: 46, author: "Paul", dateWritten: "c. AD 63", theme: "Sound doctrine that trains us to live godly lives in this present age." },
  { name: "Philemon", abbr: "Phm", testament: "NT", genre: "Epistle", chapters: 1, verses: 25, author: "Paul", dateWritten: "c. AD 60", theme: "A slave becomes a brother — the gospel transforms relationships." },
  { name: "Hebrews", abbr: "Heb", testament: "NT", genre: "Epistle", chapters: 13, verses: 303, author: "Unknown", dateWritten: "c. AD 65", theme: "Christ is better — greater than angels, Moses, and the Levitical priesthood." },
  { name: "James", abbr: "Jas", testament: "NT", genre: "Epistle", chapters: 5, verses: 108, author: "James, brother of Jesus", dateWritten: "c. AD 45", theme: "Faith that works — genuine faith is visible in how we live." },
  { name: "1 Peter", abbr: "1Pe", testament: "NT", genre: "Epistle", chapters: 5, verses: 105, author: "Peter", dateWritten: "c. AD 63", theme: "Living hope amid suffering — set apart as a holy people." },
  { name: "2 Peter", abbr: "2Pe", testament: "NT", genre: "Epistle", chapters: 3, verses: 61, author: "Peter", dateWritten: "c. AD 66", theme: "Growing in grace and knowledge — guarding against false teachers." },
  { name: "1 John", abbr: "1Jn", testament: "NT", genre: "Epistle", chapters: 5, verses: 105, author: "John the apostle", dateWritten: "c. AD 90", theme: "Light, love, and life in the Son of God — assurance for the believer." },
  { name: "2 John", abbr: "2Jn", testament: "NT", genre: "Epistle", chapters: 1, verses: 13, author: "John the apostle", dateWritten: "c. AD 90", theme: "Walking in truth and love — a warning against deceivers." },
  { name: "3 John", abbr: "3Jn", testament: "NT", genre: "Epistle", chapters: 1, verses: 14, author: "John the apostle", dateWritten: "c. AD 90", theme: "Hospitality to fellow workers for the truth." },
  { name: "Jude", abbr: "Jud", testament: "NT", genre: "Epistle", chapters: 1, verses: 25, author: "Jude, brother of James", dateWritten: "c. AD 65", theme: "Contend for the faith once for all delivered to the saints." },
  { name: "Revelation", abbr: "Rev", testament: "NT", genre: "Apocalyptic", chapters: 22, verses: 404, author: "John the apostle", dateWritten: "c. AD 95", theme: "The Lamb who was slain reigns — the Alpha and the Omega makes all things new." },
];

export const BOOKS_BY_NAME = new Map(BOOKS.map((b) => [b.name, b]));

export function getBook(name: string): BookMeta | undefined {
  return BOOKS_BY_NAME.get(decodeURIComponent(name));
}

export function getBookIndex(name: string): number {
  return BOOKS.findIndex((b) => b.name === decodeURIComponent(name));
}

/** Genre → muted border color hex (never bright) */
export const GENRE_COLORS: Record<Genre, string> = {
  Law: "#92400E",        // deep amber gold
  History: "#78350F",    // warm brown
  Poetry: "#0F766E",     // muted teal
  Wisdom: "#713F12",     // mustard
  Prophecy: "#6B21A8",   // muted purple
  Gospel: "#1E3A5F",     // deep navy
  Epistle: "#1E40AF",    // muted blue
  Apocalyptic: "#7F1D1D",// deep red
};
