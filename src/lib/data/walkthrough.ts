/**
 * The Bible Walkthrough — an ordered chronological sequence of the major
 * events in scripture, each linked to a timeline year, a geographic
 * location (when known), and a passage. Used by /walkthrough to drive a
 * synchronized timeline + map + text viewer that readers can step through
 * at their own pace.
 *
 * Dates follow the conventional conservative chronology used elsewhere in
 * the app (matches src/lib/data/timeline.ts). Locations reference ids from
 * src/lib/data/locations.ts; where an event has no specific locus (e.g.
 * creation), the locationId is null and the map centers on Jerusalem.
 *
 * This list is deliberately large — ~60 stations — so the walkthrough
 * actually feels like walking through scripture, not a highlight reel.
 */

export type WalkthroughEra =
  | "Primeval"
  | "Patriarchs"
  | "Egypt & Exodus"
  | "Conquest"
  | "Judges"
  | "United Kingdom"
  | "Divided Kingdom"
  | "Exile"
  | "Return"
  | "Intertestamental"
  | "Christ"
  | "Church";

export interface WalkthroughStop {
  id: string;
  order: number;
  title: string;
  era: WalkthroughEra;
  year: number;                     // negative = BC, positive = AD
  locationId: string | null;        // id from locations.ts, or null
  fallbackLonLat?: [number, number]; // used when locationId is null
  passage: { book: string; chapter: number; verseStart?: number; verseEnd?: number };
  summary: string;                  // 1–2 sentence orientation
  highlight: string;                // the money quote or key line
}

export const WALKTHROUGH: WalkthroughStop[] = [
  // ── Primeval ─────────────────────────────────────────────────
  { id: "creation", order: 1, title: "Creation", era: "Primeval", year: -4004, locationId: null, fallbackLonLat: [33.5, 33], passage: { book: "Genesis", chapter: 1 }, summary: "God speaks the cosmos into being across six days and rests on the seventh.", highlight: "In the beginning, God created the heavens and the earth." },
  { id: "eden", order: 2, title: "The Garden of Eden", era: "Primeval", year: -4004, locationId: null, fallbackLonLat: [44.5, 31.2], passage: { book: "Genesis", chapter: 2, verseStart: 8 }, summary: "God plants a garden in Eden and places the man there to work it and keep it.", highlight: "And the LORD God planted a garden in Eden, in the east." },
  { id: "fall", order: 3, title: "The Fall", era: "Primeval", year: -4004, locationId: null, fallbackLonLat: [44.5, 31.2], passage: { book: "Genesis", chapter: 3 }, summary: "The serpent tempts, Adam and Eve eat, and the first gospel promise is spoken to the serpent.", highlight: "He shall bruise your head, and you shall bruise his heel." },
  { id: "cain-abel", order: 4, title: "Cain and Abel", era: "Primeval", year: -3900, locationId: null, fallbackLonLat: [44.5, 31.2], passage: { book: "Genesis", chapter: 4 }, summary: "The first murder — sin bears its bitter fruit in the next generation.", highlight: "Sin is crouching at the door. Its desire is contrary to you, but you must rule over it." },
  { id: "flood", order: 5, title: "The Flood", era: "Primeval", year: -2348, locationId: null, fallbackLonLat: [44.2, 39.7], passage: { book: "Genesis", chapter: 7 }, summary: "Noah and his household preserved through the waters of judgment.", highlight: "The LORD shut him in." },
  { id: "noahic-covenant", order: 6, title: "The Rainbow Covenant", era: "Primeval", year: -2347, locationId: null, fallbackLonLat: [44.2, 39.7], passage: { book: "Genesis", chapter: 9, verseStart: 8 }, summary: "God pledges never again to destroy the earth by flood, giving the rainbow as the sign.", highlight: "I have set my bow in the cloud, and it shall be a sign of the covenant." },
  { id: "babel", order: 7, title: "The Tower of Babel", era: "Primeval", year: -2200, locationId: "babylon", passage: { book: "Genesis", chapter: 11 }, summary: "Humanity unites in pride; God confuses language and scatters the nations.", highlight: "Come, let us go down and there confuse their language." },

  // ── Patriarchs ───────────────────────────────────────────────
  { id: "abraham-called", order: 8, title: "Abraham Called", era: "Patriarchs", year: -2091, locationId: "haran", passage: { book: "Genesis", chapter: 12, verseStart: 1 }, summary: "God calls Abram out of Haran with a promise that will bless every family on earth.", highlight: "Go from your country… and I will make of you a great nation." },
  { id: "abraham-covenant", order: 9, title: "The Abrahamic Covenant", era: "Patriarchs", year: -2085, locationId: "hebron", passage: { book: "Genesis", chapter: 15 }, summary: "God cuts a covenant with Abram in a deep sleep — land, seed, and blessing guaranteed.", highlight: "And he believed the LORD, and he counted it to him as righteousness." },
  { id: "isaac-born", order: 10, title: "Isaac Born", era: "Patriarchs", year: -2066, locationId: "beersheba", passage: { book: "Genesis", chapter: 21 }, summary: "The child of promise arrives when Abraham is 100 and Sarah is past age.", highlight: "God has made laughter for me; everyone who hears will laugh over me." },
  { id: "binding-isaac", order: 11, title: "The Binding of Isaac", era: "Patriarchs", year: -2050, locationId: "jerusalem", passage: { book: "Genesis", chapter: 22 }, summary: "On Mount Moriah Abraham is tested and the substitutionary ram is provided.", highlight: "God will provide for himself the lamb for a burnt offering, my son." },
  { id: "jacob-ladder", order: 12, title: "Jacob's Ladder", era: "Patriarchs", year: -1929, locationId: "bethel", passage: { book: "Genesis", chapter: 28, verseStart: 10 }, summary: "A fleeing Jacob dreams of a ladder and the LORD renews the covenant with him.", highlight: "Surely the LORD is in this place, and I did not know it." },
  { id: "joseph-egypt", order: 13, title: "Joseph in Egypt", era: "Patriarchs", year: -1898, locationId: "goshen", passage: { book: "Genesis", chapter: 37 }, summary: "Sold by his brothers, Joseph rises to Pharaoh's right hand and preserves the covenant family.", highlight: "You meant evil against me, but God meant it for good." },

  // ── Egypt & Exodus ───────────────────────────────────────────
  { id: "burning-bush", order: 14, title: "The Burning Bush", era: "Egypt & Exodus", year: -1446, locationId: "sinai", passage: { book: "Exodus", chapter: 3 }, summary: "God calls Moses from a bush that burns but is not consumed and reveals his name.", highlight: "I AM WHO I AM." },
  { id: "plagues", order: 15, title: "The Ten Plagues", era: "Egypt & Exodus", year: -1446, locationId: "goshen", passage: { book: "Exodus", chapter: 7 }, summary: "Nine judgments fall on Egypt and its gods, each more terrible than the last.", highlight: "The Egyptians shall know that I am the LORD." },
  { id: "passover", order: 16, title: "The First Passover", era: "Egypt & Exodus", year: -1446, locationId: "goshen", passage: { book: "Exodus", chapter: 12 }, summary: "The blood of the lamb on the doorposts preserves Israel's firstborn from the angel of death.", highlight: "When I see the blood, I will pass over you." },
  { id: "red-sea", order: 17, title: "Crossing the Red Sea", era: "Egypt & Exodus", year: -1446, locationId: "red-sea", passage: { book: "Exodus", chapter: 14 }, summary: "Israel walks through the sea on dry ground; Pharaoh's army is swallowed up.", highlight: "The LORD will fight for you, and you have only to be silent." },
  { id: "sinai-law", order: 18, title: "The Law at Sinai", era: "Egypt & Exodus", year: -1446, locationId: "sinai", passage: { book: "Exodus", chapter: 19 }, summary: "At the smoking mountain God gives Israel the Ten Commandments and the covenant.", highlight: "You shall be to me a kingdom of priests and a holy nation." },
  { id: "tabernacle", order: 19, title: "The Tabernacle Built", era: "Egypt & Exodus", year: -1445, locationId: "sinai", passage: { book: "Exodus", chapter: 40, verseStart: 34 }, summary: "The cloud of glory fills the tent of meeting — God dwells with his people.", highlight: "The glory of the LORD filled the tabernacle." },
  { id: "twelve-spies", order: 20, title: "The Twelve Spies", era: "Egypt & Exodus", year: -1445, locationId: "kadesh-barnea", passage: { book: "Numbers", chapter: 13 }, summary: "Ten spies bring a bad report; Israel refuses to enter the land and wanders 38 years.", highlight: "We are not able to go up against the people, for they are stronger than we." },

  // ── Conquest ─────────────────────────────────────────────────
  { id: "jordan-crossing", order: 21, title: "Crossing the Jordan", era: "Conquest", year: -1406, locationId: "jericho", passage: { book: "Joshua", chapter: 3 }, summary: "Under Joshua, Israel crosses the swollen Jordan as the priests carry the ark.", highlight: "The waters of the Jordan were cut off." },
  { id: "jericho-walls", order: 22, title: "The Walls of Jericho", era: "Conquest", year: -1406, locationId: "jericho", passage: { book: "Joshua", chapter: 6 }, summary: "Seven days of marching, seven trumpets, a shout — and the walls fall flat.", highlight: "And the wall fell down flat." },

  // ── Judges ───────────────────────────────────────────────────
  { id: "deborah", order: 23, title: "Deborah and Barak", era: "Judges", year: -1209, locationId: "shechem", passage: { book: "Judges", chapter: 4 }, summary: "A prophetess judges Israel and delivers them from Sisera with Jael's tent peg.", highlight: "The stars fought from heaven; from their courses they fought against Sisera." },
  { id: "gideon", order: 24, title: "Gideon's Three Hundred", era: "Judges", year: -1162, locationId: "shechem", passage: { book: "Judges", chapter: 7 }, summary: "God trims Gideon's army so the glory will be his alone, and Midian is routed.", highlight: "The sword of the LORD and of Gideon!" },
  { id: "ruth", order: 25, title: "Ruth and Boaz", era: "Judges", year: -1120, locationId: "bethlehem", passage: { book: "Ruth", chapter: 1 }, summary: "A Moabite widow's steadfast love brings her into the line of David and the Messiah.", highlight: "Your people shall be my people, and your God my God." },

  // ── United Kingdom ───────────────────────────────────────────
  { id: "samuel", order: 26, title: "Samuel Anointed", era: "United Kingdom", year: -1105, locationId: "shechem", passage: { book: "1 Samuel", chapter: 3 }, summary: "The boy Samuel hears the voice of the LORD and becomes prophet, priest, and judge.", highlight: "Speak, for your servant hears." },
  { id: "david-anointed", order: 27, title: "David Anointed", era: "United Kingdom", year: -1025, locationId: "bethlehem", passage: { book: "1 Samuel", chapter: 16 }, summary: "Samuel anoints the youngest son of Jesse, a shepherd, the future king of Israel.", highlight: "The LORD looks on the heart." },
  { id: "goliath", order: 28, title: "David and Goliath", era: "United Kingdom", year: -1020, locationId: "hebron", passage: { book: "1 Samuel", chapter: 17 }, summary: "A shepherd boy with a sling slays the Philistine giant in the name of the LORD.", highlight: "The battle is the LORD's, and he will give you into our hand." },
  { id: "david-king", order: 29, title: "David Crowned over All Israel", era: "United Kingdom", year: -1003, locationId: "jerusalem", passage: { book: "2 Samuel", chapter: 5 }, summary: "Seven years after Saul, David is crowned king of a united Israel in Jerusalem.", highlight: "David became greater and greater, for the LORD of hosts was with him." },
  { id: "davidic-covenant", order: 30, title: "The Davidic Covenant", era: "United Kingdom", year: -1003, locationId: "jerusalem", passage: { book: "2 Samuel", chapter: 7 }, summary: "God promises David an enduring house, throne, and kingdom — forever.", highlight: "Your throne shall be established forever." },
  { id: "solomon-temple", order: 31, title: "Solomon's Temple", era: "United Kingdom", year: -960, locationId: "jerusalem", passage: { book: "1 Kings", chapter: 8 }, summary: "Solomon dedicates the temple and the glory of the LORD fills the holy place.", highlight: "I have built you an exalted house, a place for you to dwell in forever." },

  // ── Divided Kingdom ──────────────────────────────────────────
  { id: "kingdom-divides", order: 32, title: "The Kingdom Divides", era: "Divided Kingdom", year: -930, locationId: "shechem", passage: { book: "1 Kings", chapter: 12 }, summary: "Rehoboam's harshness splits the kingdom; Jeroboam rules the north at Shechem.", highlight: "What portion do we have in David?" },
  { id: "elijah-carmel", order: 33, title: "Elijah on Mount Carmel", era: "Divided Kingdom", year: -860, locationId: "samaria", passage: { book: "1 Kings", chapter: 18 }, summary: "Fire from heaven answers Elijah's prayer; the prophets of Baal are silenced.", highlight: "The LORD, he is God; the LORD, he is God." },
  { id: "isaiah-call", order: 34, title: "Isaiah's Call", era: "Divided Kingdom", year: -740, locationId: "jerusalem", passage: { book: "Isaiah", chapter: 6 }, summary: "Isaiah sees the LORD high and lifted up and is commissioned to proclaim.", highlight: "Here I am! Send me." },
  { id: "samaria-falls", order: 35, title: "Samaria Falls", era: "Divided Kingdom", year: -722, locationId: "samaria", passage: { book: "2 Kings", chapter: 17 }, summary: "Assyria destroys the northern kingdom and carries Israel into exile.", highlight: "This occurred because the people of Israel had sinned against the LORD their God." },

  // ── Exile ────────────────────────────────────────────────────
  { id: "jerusalem-falls", order: 36, title: "Jerusalem Falls", era: "Exile", year: -586, locationId: "jerusalem", passage: { book: "2 Kings", chapter: 25 }, summary: "Nebuchadnezzar burns the temple and deports Judah to Babylon.", highlight: "He burned the house of the LORD and the king's house." },
  { id: "daniel-babylon", order: 37, title: "Daniel in Babylon", era: "Exile", year: -605, locationId: "babylon", passage: { book: "Daniel", chapter: 1 }, summary: "A young Judean nobleman resolves not to defile himself and rises in three empires.", highlight: "But Daniel resolved that he would not defile himself." },
  { id: "ezekiel-dry-bones", order: 38, title: "Dry Bones Live", era: "Exile", year: -585, locationId: "babylon", passage: { book: "Ezekiel", chapter: 37 }, summary: "Ezekiel prophesies to a valley of bones and a vast army stands up alive.", highlight: "Can these bones live?" },

  // ── Return ───────────────────────────────────────────────────
  { id: "cyrus-decree", order: 39, title: "Cyrus's Decree", era: "Return", year: -538, locationId: "babylon", passage: { book: "Ezra", chapter: 1 }, summary: "The LORD stirs up Cyrus to send the exiles home to rebuild the temple.", highlight: "Whoever is among you of all his people, may his God be with him." },
  { id: "second-temple", order: 40, title: "The Second Temple", era: "Return", year: -516, locationId: "jerusalem", passage: { book: "Ezra", chapter: 6, verseStart: 15 }, summary: "Seventy years after its destruction a house for God stands again in Jerusalem.", highlight: "They finished their building by decree of the God of Israel." },
  { id: "nehemiah-walls", order: 41, title: "Nehemiah Rebuilds the Walls", era: "Return", year: -444, locationId: "jerusalem", passage: { book: "Nehemiah", chapter: 6, verseStart: 15 }, summary: "The walls are rebuilt in 52 days despite opposition — a city and a people restored.", highlight: "This work had been accomplished with the help of our God." },
  { id: "malachi", order: 42, title: "Malachi — the Last Prophet", era: "Return", year: -430, locationId: "jerusalem", passage: { book: "Malachi", chapter: 4 }, summary: "The Old Testament closes with a promise: a messenger is coming to prepare the way.", highlight: "Behold, I send my messenger, and he will prepare the way before me." },

  // ── Christ ───────────────────────────────────────────────────
  { id: "annunciation", order: 43, title: "The Annunciation", era: "Christ", year: -5, locationId: "nazareth", passage: { book: "Luke", chapter: 1, verseStart: 26 }, summary: "Gabriel greets a virgin in Nazareth with the news of the Son who will reign forever.", highlight: "Nothing will be impossible with God." },
  { id: "jesus-born", order: 44, title: "Jesus Born in Bethlehem", era: "Christ", year: -4, locationId: "bethlehem", passage: { book: "Luke", chapter: 2, verseStart: 1 }, summary: "A census brings Joseph to the city of David; the King is born in a manger.", highlight: "For unto you is born this day in the city of David a Savior." },
  { id: "baptism", order: 45, title: "The Baptism of Jesus", era: "Christ", year: 27, locationId: "jericho", passage: { book: "Matthew", chapter: 3, verseStart: 13 }, summary: "Jesus is baptized by John in the Jordan; the Father speaks and the Spirit descends.", highlight: "This is my beloved Son, with whom I am well pleased." },
  { id: "wilderness", order: 46, title: "The Temptation", era: "Christ", year: 27, locationId: "jericho", passage: { book: "Matthew", chapter: 4 }, summary: "Forty days in the wilderness; Jesus answers the tempter with scripture.", highlight: "Man shall not live by bread alone." },
  { id: "sermon-mount", order: 47, title: "Sermon on the Mount", era: "Christ", year: 28, locationId: "capernaum", passage: { book: "Matthew", chapter: 5 }, summary: "The manifesto of the kingdom delivered on a Galilean hillside — blessed are the poor in spirit.", highlight: "You are the light of the world. A city set on a hill cannot be hidden." },
  { id: "storm-stilled", order: 48, title: "The Storm Stilled", era: "Christ", year: 29, locationId: "sea-galilee", passage: { book: "Mark", chapter: 4, verseStart: 35 }, summary: "Jesus speaks to wind and waves and they obey — who then is this?", highlight: "Peace! Be still!" },
  { id: "feeding-5000", order: 49, title: "The Feeding of the 5,000", era: "Christ", year: 29, locationId: "capernaum", passage: { book: "John", chapter: 6 }, summary: "Five loaves and two fish become a feast — he is the bread of life.", highlight: "I am the bread of life." },
  { id: "transfiguration", order: 50, title: "The Transfiguration", era: "Christ", year: 29, locationId: "capernaum", passage: { book: "Matthew", chapter: 17 }, summary: "On a high mountain his face shines like the sun and Moses and Elijah appear with him.", highlight: "This is my beloved Son, with whom I am well pleased; listen to him." },
  { id: "triumphal-entry", order: 51, title: "The Triumphal Entry", era: "Christ", year: 30, locationId: "jerusalem", passage: { book: "Matthew", chapter: 21 }, summary: "Jesus rides into Jerusalem on a donkey to the shouts of 'Hosanna!'", highlight: "Blessed is he who comes in the name of the Lord!" },
  { id: "last-supper", order: 52, title: "The Last Supper", era: "Christ", year: 30, locationId: "jerusalem", passage: { book: "Luke", chapter: 22, verseStart: 14 }, summary: "In an upper room Jesus institutes the new covenant in his blood.", highlight: "This cup that is poured out for you is the new covenant in my blood." },
  { id: "crucifixion", order: 53, title: "The Crucifixion", era: "Christ", year: 30, locationId: "jerusalem", passage: { book: "Luke", chapter: 23, verseStart: 33 }, summary: "At Golgotha the Son of God is crucified between two thieves.", highlight: "Father, forgive them, for they know not what they do." },
  { id: "resurrection", order: 54, title: "The Resurrection", era: "Christ", year: 30, locationId: "jerusalem", passage: { book: "Luke", chapter: 24 }, summary: "On the third day the tomb is empty and the women hear the news from an angel.", highlight: "He is not here, but has risen." },
  { id: "great-commission", order: 55, title: "The Great Commission", era: "Christ", year: 30, locationId: "capernaum", passage: { book: "Matthew", chapter: 28, verseStart: 16 }, summary: "All authority has been given to the risen Christ, who sends his disciples to all nations.", highlight: "Go therefore and make disciples of all nations." },

  // ── Church ───────────────────────────────────────────────────
  { id: "pentecost", order: 56, title: "Pentecost", era: "Church", year: 30, locationId: "jerusalem", passage: { book: "Acts", chapter: 2 }, summary: "The Spirit is poured out, Peter preaches, and 3,000 are added to the church.", highlight: "This Jesus God raised up, and of that we all are witnesses." },
  { id: "stephen", order: 57, title: "Stephen Martyred", era: "Church", year: 34, locationId: "jerusalem", passage: { book: "Acts", chapter: 7 }, summary: "The first Christian martyr preaches to the Sanhedrin and is stoned — Saul approving.", highlight: "Lord, do not hold this sin against them." },
  { id: "saul-converted", order: 58, title: "Saul Converted", era: "Church", year: 34, locationId: "antioch-syria", passage: { book: "Acts", chapter: 9 }, summary: "On the road to Damascus the risen Christ confronts Saul; the persecutor becomes apostle.", highlight: "Saul, Saul, why are you persecuting me?" },
  { id: "jerusalem-council", order: 59, title: "The Jerusalem Council", era: "Church", year: 49, locationId: "jerusalem", passage: { book: "Acts", chapter: 15 }, summary: "The apostles confirm the gospel is for the Gentiles by grace through faith.", highlight: "We believe that we will be saved through the grace of the Lord Jesus." },
  { id: "paul-athens", order: 60, title: "Paul at the Areopagus", era: "Church", year: 51, locationId: "athens", passage: { book: "Acts", chapter: 17, verseStart: 22 }, summary: "Paul preaches to the philosophers, quoting their own poets, proclaiming the unknown God.", highlight: "In him we live and move and have our being." },
  { id: "paul-ephesus", order: 61, title: "Paul at Ephesus", era: "Church", year: 54, locationId: "ephesus", passage: { book: "Acts", chapter: 19 }, summary: "Two years of daily teaching in the hall of Tyrannus; all Asia hears the word.", highlight: "All the residents of Asia heard the word of the Lord." },
  { id: "paul-rome", order: 62, title: "Paul in Rome", era: "Church", year: 60, locationId: "rome", passage: { book: "Acts", chapter: 28, verseStart: 16 }, summary: "The prisoner apostle reaches Rome and proclaims the kingdom openly.", highlight: "Proclaiming the kingdom of God and teaching about the Lord Jesus Christ with all boldness." },
  { id: "patmos", order: 63, title: "Revelation on Patmos", era: "Church", year: 95, locationId: "patmos", passage: { book: "Revelation", chapter: 1 }, summary: "The aged apostle John sees the risen Christ among the lampstands and writes what he sees.", highlight: "I am the Alpha and the Omega… who is and who was and who is to come." },
  { id: "new-creation", order: 64, title: "A New Heavens and New Earth", era: "Church", year: 95, locationId: null, fallbackLonLat: [35.2137, 31.7683], passage: { book: "Revelation", chapter: 21 }, summary: "The vision ends with the bride, the Lamb, and a world made new — the goal of all history.", highlight: "Behold, I am making all things new." },
];

export const ERA_ORDER: WalkthroughEra[] = [
  "Primeval",
  "Patriarchs",
  "Egypt & Exodus",
  "Conquest",
  "Judges",
  "United Kingdom",
  "Divided Kingdom",
  "Exile",
  "Return",
  "Intertestamental",
  "Christ",
  "Church",
];

export const ERA_COLORS: Record<WalkthroughEra, string> = {
  Primeval: "#78350F",
  Patriarchs: "#92400E",
  "Egypt & Exodus": "#713F12",
  Conquest: "#7F1D1D",
  Judges: "#57534E",
  "United Kingdom": "#1E3A5F",
  "Divided Kingdom": "#1E40AF",
  Exile: "#3F3B37",
  Return: "#6B21A8",
  Intertestamental: "#A8A29E",
  Christ: "#D97706",
  Church: "#0F766E",
};
