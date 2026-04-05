/**
 * Macro timeline data — epochs, events, covenants.
 * Dates use negative numbers for BC, positive for AD.
 */

export type TimelineEpoch = {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  color: string;
  description: string;
};

export const EPOCHS: TimelineEpoch[] = [
  { id: "patriarchs", name: "Patriarchs", startYear: -2100, endYear: -1876, color: "#FEF3C7", description: "Abraham, Isaac, Jacob — the covenant family before Egypt." },
  { id: "egypt-exodus", name: "Egypt & Exodus", startYear: -1876, endYear: -1400, color: "#FDE68A", description: "Joseph's Egypt, the 400 years, Moses, and the Exodus." },
  { id: "conquest", name: "Conquest", startYear: -1400, endYear: -1350, color: "#FCD34D", description: "Joshua leads Israel into Canaan and divides the inheritance." },
  { id: "judges", name: "Judges", startYear: -1350, endYear: -1050, color: "#F3E8D0", description: "Cycles of apostasy and deliverance before the monarchy." },
  { id: "united-kingdom", name: "United Kingdom", startYear: -1050, endYear: -930, color: "#EFF6FF", description: "Saul, David, Solomon — the kingdom under one throne." },
  { id: "divided-kingdom", name: "Divided Kingdom", startYear: -930, endYear: -722, color: "#DBEAFE", description: "Israel in the north, Judah in the south." },
  { id: "judah-alone", name: "Judah Alone", startYear: -722, endYear: -586, color: "#BFDBFE", description: "Assyria takes the north; Judah stands alone until Babylon falls on Jerusalem." },
  { id: "exile", name: "Exile", startYear: -586, endYear: -538, color: "#A8A29E", description: "Judah in Babylon — Daniel, Ezekiel, and the seventy years." },
  { id: "return", name: "Return", startYear: -538, endYear: -400, color: "#E7E5E4", description: "Zerubbabel, Ezra, and Nehemiah lead the rebuilding of temple and walls." },
  { id: "intertestamental", name: "Intertestamental", startYear: -400, endYear: -4, color: "#D6D3D1", description: "The 400 silent years between Malachi and Matthew." },
  { id: "nt-era", name: "NT Era", startYear: -4, endYear: 100, color: "#FEF3C7", description: "The life of Christ and the apostolic age." },
];

export type TimelineEvent = {
  id: string;
  name: string;
  year: number;
  epochId: string;
  importance: 1 | 2 | 3; // 3 = covenant-level, 2 = major, 1 = standard
  passage: { book: string; chapter: number; verseStart?: number };
  description: string;
};

export const TIMELINE_EVENTS: TimelineEvent[] = [
  { id: "creation", name: "Creation", year: -4004, epochId: "patriarchs", importance: 3, passage: { book: "Genesis", chapter: 1 }, description: "In the beginning, God created the heavens and the earth." },
  { id: "flood", name: "The Flood", year: -2348, epochId: "patriarchs", importance: 2, passage: { book: "Genesis", chapter: 7 }, description: "Noah and his family preserved through the waters of judgment." },
  { id: "babel", name: "Tower of Babel", year: -2200, epochId: "patriarchs", importance: 1, passage: { book: "Genesis", chapter: 11 }, description: "Languages confused; the nations scattered." },
  { id: "abraham-called", name: "Abraham called", year: -2091, epochId: "patriarchs", importance: 3, passage: { book: "Genesis", chapter: 12, verseStart: 1 }, description: "'Go from your country… and I will make of you a great nation.'" },
  { id: "isaac-born", name: "Isaac born", year: -2066, epochId: "patriarchs", importance: 1, passage: { book: "Genesis", chapter: 21 }, description: "The child of promise, born when Abraham is 100." },
  { id: "joseph-egypt", name: "Joseph sold into Egypt", year: -1898, epochId: "egypt-exodus", importance: 1, passage: { book: "Genesis", chapter: 37 }, description: "God preserves the covenant family by sending Joseph ahead." },
  { id: "exodus", name: "The Exodus", year: -1446, epochId: "egypt-exodus", importance: 3, passage: { book: "Exodus", chapter: 12 }, description: "Passover and the deliverance from Egypt under Moses." },
  { id: "sinai", name: "Law given at Sinai", year: -1446, epochId: "egypt-exodus", importance: 3, passage: { book: "Exodus", chapter: 19 }, description: "The covenant with Israel, the Ten Commandments, the tabernacle pattern." },
  { id: "conquest-jericho", name: "Conquest of Jericho", year: -1406, epochId: "conquest", importance: 2, passage: { book: "Joshua", chapter: 6 }, description: "The walls fall at the trumpet's sound." },
  { id: "judges-begin", name: "Cycles of the Judges begin", year: -1350, epochId: "judges", importance: 1, passage: { book: "Judges", chapter: 2, verseStart: 11 }, description: "Israel does what is right in their own eyes." },
  { id: "samuel", name: "Samuel anoints Saul", year: -1050, epochId: "united-kingdom", importance: 1, passage: { book: "1 Samuel", chapter: 10 }, description: "Israel's first king." },
  { id: "david-crowned", name: "David crowned over Israel", year: -1010, epochId: "united-kingdom", importance: 2, passage: { book: "2 Samuel", chapter: 5 }, description: "The shepherd-king begins his 40-year reign." },
  { id: "davidic-covenant", name: "Davidic Covenant", year: -1003, epochId: "united-kingdom", importance: 3, passage: { book: "2 Samuel", chapter: 7 }, description: "'Your throne shall be established forever.'" },
  { id: "temple-built", name: "Solomon's Temple completed", year: -960, epochId: "united-kingdom", importance: 2, passage: { book: "1 Kings", chapter: 8 }, description: "The glory of the LORD fills the temple." },
  { id: "kingdom-divided", name: "Kingdom divides", year: -930, epochId: "divided-kingdom", importance: 2, passage: { book: "1 Kings", chapter: 12 }, description: "Rehoboam in Judah, Jeroboam in Israel." },
  { id: "elijah", name: "Elijah on Mount Carmel", year: -860, epochId: "divided-kingdom", importance: 1, passage: { book: "1 Kings", chapter: 18 }, description: "'The LORD, he is God!'" },
  { id: "isaiah-call", name: "Isaiah's call", year: -740, epochId: "divided-kingdom", importance: 1, passage: { book: "Isaiah", chapter: 6 }, description: "'Whom shall I send, and who will go for us?'" },
  { id: "samaria-falls", name: "Samaria falls to Assyria", year: -722, epochId: "judah-alone", importance: 2, passage: { book: "2 Kings", chapter: 17 }, description: "The northern kingdom taken into exile." },
  { id: "jerusalem-falls", name: "Jerusalem falls to Babylon", year: -586, epochId: "exile", importance: 2, passage: { book: "2 Kings", chapter: 25 }, description: "The temple is destroyed and Judah goes into exile." },
  { id: "daniel-deported", name: "Daniel taken to Babylon", year: -605, epochId: "exile", importance: 1, passage: { book: "Daniel", chapter: 1 }, description: "The first deportation under Nebuchadnezzar." },
  { id: "return-cyrus", name: "Cyrus's decree — return from exile", year: -538, epochId: "return", importance: 2, passage: { book: "Ezra", chapter: 1 }, description: "The LORD stirred up the spirit of Cyrus." },
  { id: "temple-rebuilt", name: "Second temple dedicated", year: -516, epochId: "return", importance: 1, passage: { book: "Ezra", chapter: 6, verseStart: 15 }, description: "Seventy years after its destruction, a house for God stands again." },
  { id: "malachi", name: "Malachi — the last OT prophet", year: -430, epochId: "return", importance: 1, passage: { book: "Malachi", chapter: 1 }, description: "'Behold, I send my messenger…'" },
  { id: "jesus-born", name: "Jesus born in Bethlehem", year: -4, epochId: "nt-era", importance: 3, passage: { book: "Luke", chapter: 2 }, description: "'For unto you is born this day in the city of David a Savior, who is Christ the Lord.'" },
  { id: "jesus-ministry", name: "Ministry begins (baptism)", year: 27, epochId: "nt-era", importance: 2, passage: { book: "Matthew", chapter: 3 }, description: "'This is my beloved Son, with whom I am well pleased.'" },
  { id: "crucifixion", name: "Crucifixion & Resurrection", year: 30, epochId: "nt-era", importance: 3, passage: { book: "Luke", chapter: 23 }, description: "'It is finished.' The third day He rose again." },
  { id: "pentecost", name: "Pentecost — Spirit poured out", year: 30, epochId: "nt-era", importance: 3, passage: { book: "Acts", chapter: 2 }, description: "The birth of the church; the gospel begins its global advance." },
  { id: "paul-converted", name: "Paul converted", year: 34, epochId: "nt-era", importance: 1, passage: { book: "Acts", chapter: 9 }, description: "'Saul, Saul, why are you persecuting me?'" },
  { id: "jerusalem-council", name: "Jerusalem Council", year: 49, epochId: "nt-era", importance: 1, passage: { book: "Acts", chapter: 15 }, description: "The gospel is for Gentiles as Gentiles, by grace through faith." },
  { id: "temple-destroyed-70", name: "Temple destroyed", year: 70, epochId: "nt-era", importance: 2, passage: { book: "Luke", chapter: 21, verseStart: 6 }, description: "As Jesus foretold — not one stone left upon another." },
  { id: "revelation", name: "Revelation given on Patmos", year: 95, epochId: "nt-era", importance: 2, passage: { book: "Revelation", chapter: 1 }, description: "The unveiling of Jesus Christ." },
];

export type Covenant = {
  id: string;
  name: string;
  year: number;
  parties: string;
  promise: string;
  sign: string;
  passage: { book: string; chapter: number };
  status: "active" | "fulfilled-expanded";
};

export const COVENANTS: Covenant[] = [
  { id: "noahic", name: "Noahic Covenant", year: -2348, parties: "God → Noah → all flesh", promise: "Never again will a flood destroy the earth; the seasons will continue.", sign: "The rainbow in the clouds", passage: { book: "Genesis", chapter: 9 }, status: "active" },
  { id: "abrahamic", name: "Abrahamic Covenant", year: -2091, parties: "God → Abraham → his offspring", promise: "A land, a people, and blessing to all nations.", sign: "Circumcision", passage: { book: "Genesis", chapter: 15 }, status: "fulfilled-expanded" },
  { id: "mosaic", name: "Mosaic Covenant", year: -1446, parties: "God → Israel through Moses", promise: "Blessing for obedience, exile for disobedience — a kingdom of priests.", sign: "The Sabbath", passage: { book: "Exodus", chapter: 19 }, status: "fulfilled-expanded" },
  { id: "davidic", name: "Davidic Covenant", year: -1003, parties: "God → David → his Son", promise: "An eternal throne and kingdom through David's offspring.", sign: "The temple", passage: { book: "2 Samuel", chapter: 7 }, status: "fulfilled-expanded" },
  { id: "new", name: "New Covenant", year: 30, parties: "God → all who are in Christ", promise: "Forgiveness of sins, the law on the heart, the Spirit poured out.", sign: "The Lord's Supper", passage: { book: "Luke", chapter: 22 }, status: "active" },
];
