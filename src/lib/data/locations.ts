/**
 * Biblical geography — key locations, journeys, and date ranges.
 *
 * dateRange uses negative numbers for BCE and positive for CE.
 * These are approximate scholarly ranges — the goal is
 * usable filtering, not precision chronology.
 */

export type Period =
  | "Patriarchal"
  | "Exodus"
  | "Conquest"
  | "Monarchy"
  | "Exile"
  | "NT"
  | "Return";

export const PERIOD_DATES: Record<Period, { from: number; to: number; label: string }> = {
  Patriarchal: { from: -2100, to: -1800, label: "c. 2100–1800 BC" },
  Exodus:      { from: -1446, to: -1406, label: "c. 1446–1406 BC" },
  Conquest:    { from: -1406, to: -1050, label: "c. 1406–1050 BC" },
  Monarchy:    { from: -1050, to: -586,  label: "c. 1050–586 BC" },
  Exile:       { from: -586,  to: -538,  label: "c. 586–538 BC" },
  Return:      { from: -538,  to: -400,  label: "c. 538–400 BC" },
  NT:          { from: -5,    to: 100,   label: "c. 5 BC – AD 100" },
};

export type Location = {
  id: string;
  name: string;
  modernName?: string;
  lon: number;
  lat: number;
  periods: Period[];
  dateRange: { from: number; to: number };
  description: string;
  passages: Array<{ book: string; chapter: number; verse?: number }>;
};

export const LOCATIONS: Location[] = [
  // ── Patriarchal ──
  { id: "ur", name: "Ur of the Chaldeans", modernName: "Tell el-Muqayyar, Iraq", lon: 46.103, lat: 30.963, periods: ["Patriarchal"], dateRange: { from: -2166, to: -2091 }, description: "The ancient Sumerian city where Abram was born, and from which God called him to the land of Canaan.", passages: [{ book: "Genesis", chapter: 11, verse: 31 }, { book: "Nehemiah", chapter: 9, verse: 7 }] },
  { id: "haran", name: "Haran", modernName: "Harran, Turkey", lon: 39.032, lat: 36.866, periods: ["Patriarchal"], dateRange: { from: -2091, to: -2066 }, description: "The way-station where Terah settled and where Abram received the second call to Canaan.", passages: [{ book: "Genesis", chapter: 11, verse: 31 }, { book: "Genesis", chapter: 12, verse: 4 }] },
  { id: "shechem", name: "Shechem", modernName: "Nablus, West Bank", lon: 35.266, lat: 32.213, periods: ["Patriarchal", "Conquest", "Monarchy"], dateRange: { from: -2091, to: -930 }, description: "Abram's first stop in Canaan, where he built an altar. Later the covenant renewal site under Joshua and the place where the kingdom divided under Rehoboam.", passages: [{ book: "Genesis", chapter: 12, verse: 6 }, { book: "Joshua", chapter: 24, verse: 1 }, { book: "1 Kings", chapter: 12 }] },
  { id: "bethel", name: "Bethel", modernName: "Beitin, West Bank", lon: 35.240, lat: 31.930, periods: ["Patriarchal", "Conquest", "Monarchy"], dateRange: { from: -2066, to: -900 }, description: "House of God — where Jacob saw the ladder. Later a center of false worship under Jeroboam.", passages: [{ book: "Genesis", chapter: 28, verse: 19 }, { book: "1 Kings", chapter: 12, verse: 29 }] },
  { id: "hebron", name: "Hebron", modernName: "Hebron, West Bank", lon: 35.095, lat: 31.532, periods: ["Patriarchal", "Conquest", "Monarchy"], dateRange: { from: -2066, to: -1003 }, description: "Abraham settled here under the oaks of Mamre. Later David's first capital before Jerusalem.", passages: [{ book: "Genesis", chapter: 13, verse: 18 }, { book: "2 Samuel", chapter: 2, verse: 1 }] },
  { id: "beersheba", name: "Beersheba", modernName: "Beer Sheva, Israel", lon: 34.791, lat: 31.252, periods: ["Patriarchal"], dateRange: { from: -2066, to: -1800 }, description: "The 'well of seven' — the southern boundary of the Promised Land and a place of covenant oaths.", passages: [{ book: "Genesis", chapter: 21, verse: 31 }, { book: "Genesis", chapter: 26, verse: 33 }] },

  // ── Exodus ──
  { id: "goshen", name: "Goshen", modernName: "Eastern Nile delta, Egypt", lon: 31.900, lat: 30.500, periods: ["Patriarchal", "Exodus"], dateRange: { from: -1876, to: -1446 }, description: "The fertile region of the Nile delta where Israel settled under Joseph and multiplied into a great nation before the Exodus.", passages: [{ book: "Genesis", chapter: 47, verse: 6 }, { book: "Exodus", chapter: 8, verse: 22 }] },
  { id: "sinai", name: "Mount Sinai", modernName: "Jebel Musa (traditional), Sinai", lon: 33.973, lat: 28.539, periods: ["Exodus"], dateRange: { from: -1446, to: -1445 }, description: "The mountain of God where the Law was given and the covenant established with Israel.", passages: [{ book: "Exodus", chapter: 19 }, { book: "Exodus", chapter: 24 }] },
  { id: "red-sea", name: "Red Sea crossing", modernName: "Northern Gulf of Suez (traditional)", lon: 32.550, lat: 29.900, periods: ["Exodus"], dateRange: { from: -1446, to: -1446 }, description: "The miraculous crossing that marks Israel's deliverance from Egyptian bondage.", passages: [{ book: "Exodus", chapter: 14 }] },
  { id: "kadesh-barnea", name: "Kadesh Barnea", modernName: "Ein el-Qudeirat, Sinai", lon: 34.415, lat: 30.673, periods: ["Exodus"], dateRange: { from: -1446, to: -1407 }, description: "Where the twelve spies were sent out and where Israel refused to enter the land — the starting point of 38 years of wandering.", passages: [{ book: "Numbers", chapter: 13, verse: 26 }, { book: "Deuteronomy", chapter: 1, verse: 19 }] },

  // ── Conquest / Monarchy ──
  { id: "jericho", name: "Jericho", modernName: "Tell es-Sultan, West Bank", lon: 35.444, lat: 31.871, periods: ["Conquest", "NT"], dateRange: { from: -1406, to: 30 }, description: "The first city taken in the Conquest — walls falling at the sound of the trumpet. Also the city where Jesus healed Bartimaeus and met Zacchaeus.", passages: [{ book: "Joshua", chapter: 6 }, { book: "Luke", chapter: 19, verse: 1 }] },
  { id: "jerusalem", name: "Jerusalem", modernName: "Jerusalem, Israel", lon: 35.2137, lat: 31.7683, periods: ["Monarchy", "Exile", "NT", "Return"], dateRange: { from: -1003, to: 70 }, description: "The city of David, Zion, the city of the great King. Site of Solomon's temple, the crucifixion and resurrection, and Pentecost.", passages: [{ book: "2 Samuel", chapter: 5, verse: 6 }, { book: "Luke", chapter: 23 }, { book: "Acts", chapter: 2 }] },
  { id: "bethlehem", name: "Bethlehem", modernName: "Bethlehem, West Bank", lon: 35.200, lat: 31.705, periods: ["Patriarchal", "Monarchy", "NT"], dateRange: { from: -1100, to: -4 }, description: "The town of David, prophesied as the birthplace of the Messiah. Where Ruth met Boaz and where Jesus was born.", passages: [{ book: "Ruth", chapter: 1, verse: 22 }, { book: "Micah", chapter: 5, verse: 2 }, { book: "Luke", chapter: 2, verse: 4 }] },
  { id: "samaria", name: "Samaria", modernName: "Sebastia, West Bank", lon: 35.191, lat: 32.276, periods: ["Monarchy", "Exile", "NT"], dateRange: { from: -880, to: 30 }, description: "Capital of the northern kingdom built by Omri. Later home of the Samaritans of New Testament times.", passages: [{ book: "1 Kings", chapter: 16, verse: 24 }, { book: "John", chapter: 4, verse: 4 }] },
  { id: "nineveh", name: "Nineveh", modernName: "Mosul, Iraq", lon: 43.148, lat: 36.359, periods: ["Monarchy", "Exile"], dateRange: { from: -800, to: -612 }, description: "The great city of Assyria — Jonah's reluctant mission, Nahum's oracle of judgment.", passages: [{ book: "Jonah", chapter: 3, verse: 3 }, { book: "Nahum", chapter: 1 }] },
  { id: "babylon", name: "Babylon", modernName: "Hillah, Iraq", lon: 44.420, lat: 32.542, periods: ["Exile", "Return"], dateRange: { from: -605, to: -538 }, description: "The empire that destroyed Jerusalem in 586 BC and carried Judah into exile. Daniel served three kings here.", passages: [{ book: "2 Kings", chapter: 25 }, { book: "Daniel", chapter: 1 }] },
  { id: "hazor", name: "Hazor", modernName: "Tell el-Qedah, Israel", lon: 35.567, lat: 33.017, periods: ["Conquest"], dateRange: { from: -1406, to: -1350 }, description: "The largest city in Canaan — defeated by Joshua and its king killed. Later fortified by Solomon.", passages: [{ book: "Joshua", chapter: 11, verse: 10 }, { book: "1 Kings", chapter: 9, verse: 15 }] },
  { id: "dan", name: "Dan", modernName: "Tel Dan, Israel", lon: 35.652, lat: 33.249, periods: ["Conquest", "Monarchy"], dateRange: { from: -1400, to: -722 }, description: "The northernmost city of Israel — 'from Dan to Beersheba.' Jeroboam set up a golden calf here.", passages: [{ book: "Judges", chapter: 18, verse: 29 }, { book: "1 Kings", chapter: 12, verse: 29 }] },

  // ── New Testament ──
  { id: "nazareth", name: "Nazareth", modernName: "Nazareth, Israel", lon: 35.302, lat: 32.702, periods: ["NT"], dateRange: { from: -5, to: 30 }, description: "The hill town in Galilee where Jesus was raised — obscure enough that Nathanael asked, 'Can anything good come out of Nazareth?'", passages: [{ book: "Luke", chapter: 2, verse: 39 }, { book: "John", chapter: 1, verse: 46 }] },
  { id: "capernaum", name: "Capernaum", modernName: "Kfar Nahum, Israel", lon: 35.574, lat: 32.880, periods: ["NT"], dateRange: { from: 27, to: 30 }, description: "Jesus' adopted hometown during his Galilean ministry, on the north shore of the Sea of Galilee.", passages: [{ book: "Matthew", chapter: 4, verse: 13 }, { book: "Mark", chapter: 2, verse: 1 }] },
  { id: "sea-galilee", name: "Sea of Galilee", modernName: "Lake Kinneret, Israel", lon: 35.589, lat: 32.820, periods: ["NT"], dateRange: { from: 27, to: 30 }, description: "A freshwater lake, the setting for much of Jesus' teaching, his calling of fishermen, and his walking on the water.", passages: [{ book: "Matthew", chapter: 14, verse: 25 }, { book: "Luke", chapter: 5 }] },
  { id: "damascus", name: "Damascus", modernName: "Damascus, Syria", lon: 36.314, lat: 33.513, periods: ["Patriarchal", "NT"], dateRange: { from: -2000, to: 35 }, description: "One of the oldest continuously inhabited cities. Where Saul of Tarsus was blinded and converted on the road, and lowered over the wall in a basket.", passages: [{ book: "Genesis", chapter: 15, verse: 2 }, { book: "Acts", chapter: 9, verse: 3 }, { book: "2 Corinthians", chapter: 11, verse: 33 }] },
  { id: "caesarea", name: "Caesarea Maritima", modernName: "Caesarea, Israel", lon: 34.892, lat: 32.500, periods: ["NT"], dateRange: { from: 30, to: 62 }, description: "The Roman administrative capital of Judea where Cornelius was converted, Philip the evangelist lived, and Paul was tried before Felix and Festus.", passages: [{ book: "Acts", chapter: 10, verse: 1 }, { book: "Acts", chapter: 23, verse: 33 }] },
  { id: "tyre", name: "Tyre", modernName: "Tyre, Lebanon", lon: 35.195, lat: 33.271, periods: ["Monarchy", "NT"], dateRange: { from: -950, to: 57 }, description: "The great Phoenician port — Solomon traded with King Hiram of Tyre for temple materials. Paul spent a week with disciples here on his journey to Jerusalem.", passages: [{ book: "1 Kings", chapter: 5, verse: 1 }, { book: "Acts", chapter: 21, verse: 3 }] },
  { id: "antioch-syria", name: "Antioch (Syria)", modernName: "Antakya, Turkey", lon: 36.201, lat: 36.202, periods: ["NT"], dateRange: { from: 40, to: 57 }, description: "Where disciples were first called Christians and where Paul and Barnabas were sent out on the first missionary journey.", passages: [{ book: "Acts", chapter: 11, verse: 26 }, { book: "Acts", chapter: 13, verse: 2 }] },
  { id: "salamis", name: "Salamis", modernName: "Famagusta, Cyprus", lon: 33.903, lat: 35.181, periods: ["NT"], dateRange: { from: 46, to: 46 }, description: "The first stop in Cyprus on Paul's first missionary journey — they preached in the Jewish synagogues here.", passages: [{ book: "Acts", chapter: 13, verse: 5 }] },
  { id: "paphos", name: "Paphos", modernName: "Paphos, Cyprus", lon: 32.403, lat: 34.753, periods: ["NT"], dateRange: { from: 46, to: 46 }, description: "The Roman capital of Cyprus where Paul confronted the sorcerer Bar-Jesus and the proconsul Sergius Paulus believed.", passages: [{ book: "Acts", chapter: 13, verse: 6 }] },
  { id: "perga", name: "Perga", modernName: "Perge, Turkey", lon: 30.853, lat: 36.968, periods: ["NT"], dateRange: { from: 46, to: 48 }, description: "A city of Pamphylia where John Mark departed from Paul and Barnabas and returned to Jerusalem.", passages: [{ book: "Acts", chapter: 13, verse: 13 }] },
  { id: "pisidian-antioch", name: "Pisidian Antioch", modernName: "Yalvaç, Turkey", lon: 31.173, lat: 38.304, periods: ["NT"], dateRange: { from: 46, to: 48 }, description: "Where Paul preached his first recorded major sermon in the synagogue, tracing salvation history from the Exodus to Christ.", passages: [{ book: "Acts", chapter: 13, verse: 14 }] },
  { id: "iconium", name: "Iconium", modernName: "Konya, Turkey", lon: 32.489, lat: 37.871, periods: ["NT"], dateRange: { from: 47, to: 52 }, description: "Paul and Barnabas preached here and a great number of Jews and Gentiles believed, but the city was divided.", passages: [{ book: "Acts", chapter: 14, verse: 1 }] },
  { id: "lystra", name: "Lystra", modernName: "Hatunsaray, Turkey", lon: 32.370, lat: 37.572, periods: ["NT"], dateRange: { from: 47, to: 52 }, description: "Where Paul healed a lame man and the crowds tried to worship Paul and Barnabas as gods. Paul was later stoned and left for dead. Timothy's hometown.", passages: [{ book: "Acts", chapter: 14, verse: 8 }, { book: "Acts", chapter: 16, verse: 1 }] },
  { id: "derbe", name: "Derbe", modernName: "Kerti Hüyük, Turkey", lon: 33.390, lat: 37.377, periods: ["NT"], dateRange: { from: 47, to: 52 }, description: "The furthest point of Paul's first missionary journey. Many disciples were won here before the return leg.", passages: [{ book: "Acts", chapter: 14, verse: 20 }] },
  { id: "troas", name: "Troas", modernName: "Dalyan, Turkey", lon: 26.158, lat: 39.761, periods: ["NT"], dateRange: { from: 49, to: 57 }, description: "The port where Paul received the Macedonian vision: 'Come over and help us.' Also where Eutychus fell from the window.", passages: [{ book: "Acts", chapter: 16, verse: 9 }, { book: "Acts", chapter: 20, verse: 9 }] },
  { id: "thessalonica", name: "Thessalonica", modernName: "Thessaloniki, Greece", lon: 22.950, lat: 40.627, periods: ["NT"], dateRange: { from: 50, to: 52 }, description: "A major Macedonian city where Paul established a church despite opposition. He later wrote two letters encouraging them about Christ's return.", passages: [{ book: "Acts", chapter: 17, verse: 1 }, { book: "1 Thessalonians", chapter: 1 }] },
  { id: "berea", name: "Berea", modernName: "Veria, Greece", lon: 22.202, lat: 40.469, periods: ["NT"], dateRange: { from: 50, to: 50 }, description: "The city of the 'noble Bereans' who received Paul's message eagerly and examined the Scriptures daily to see if what he said was true.", passages: [{ book: "Acts", chapter: 17, verse: 10 }] },
  { id: "ephesus", name: "Ephesus", modernName: "Selçuk, Turkey", lon: 27.341, lat: 37.941, periods: ["NT"], dateRange: { from: 52, to: 95 }, description: "Paul's long-term ministry base in Asia Minor, and one of the seven churches of Revelation. The silversmiths' riot shows the impact of the gospel.", passages: [{ book: "Acts", chapter: 19 }, { book: "Ephesians", chapter: 1 }, { book: "Revelation", chapter: 2, verse: 1 }] },
  { id: "philippi", name: "Philippi", modernName: "Filippoi, Greece", lon: 24.287, lat: 41.013, periods: ["NT"], dateRange: { from: 50, to: 57 }, description: "The first European city where Paul preached the gospel — Lydia's heart was opened here, and Paul and Silas sang in prison.", passages: [{ book: "Acts", chapter: 16, verse: 12 }, { book: "Philippians", chapter: 1 }] },
  { id: "corinth", name: "Corinth", modernName: "Archaia Korinthos, Greece", lon: 22.880, lat: 37.906, periods: ["NT"], dateRange: { from: 50, to: 57 }, description: "A wealthy, cosmopolitan port where Paul stayed 18 months and to which he wrote two of his most personal letters.", passages: [{ book: "Acts", chapter: 18 }, { book: "1 Corinthians", chapter: 1 }] },
  { id: "athens", name: "Athens", modernName: "Athens, Greece", lon: 23.728, lat: 37.984, periods: ["NT"], dateRange: { from: 50, to: 50 }, description: "Where Paul preached to the philosophers on the Areopagus, quoting their own poets.", passages: [{ book: "Acts", chapter: 17, verse: 22 }] },
  { id: "miletus", name: "Miletus", modernName: "Milet, Turkey", lon: 27.279, lat: 37.530, periods: ["NT"], dateRange: { from: 57, to: 57 }, description: "Where Paul gave his emotional farewell to the Ephesian elders, warning of wolves among the flock.", passages: [{ book: "Acts", chapter: 20, verse: 17 }] },
  { id: "crete", name: "Fair Havens, Crete", modernName: "Kaloi Limenes, Crete, Greece", lon: 24.811, lat: 34.918, periods: ["NT"], dateRange: { from: 60, to: 65 }, description: "Paul stopped here during his voyage to Rome. He warned against continuing, but the ship sailed on into the storm. Titus was later left to appoint elders.", passages: [{ book: "Acts", chapter: 27, verse: 8 }, { book: "Titus", chapter: 1, verse: 5 }] },
  { id: "malta", name: "Malta", modernName: "Malta", lon: 14.405, lat: 35.938, periods: ["NT"], dateRange: { from: 60, to: 60 }, description: "The island where Paul was shipwrecked for three months. A viper bit him but he was unharmed, and he healed many on the island.", passages: [{ book: "Acts", chapter: 28, verse: 1 }] },
  { id: "rome", name: "Rome", modernName: "Rome, Italy", lon: 12.496, lat: 41.902, periods: ["NT"], dateRange: { from: 57, to: 68 }, description: "The capital of the Empire. Paul appealed to Caesar and wrote his letter to the believers there. Tradition holds that both Peter and Paul were martyred here.", passages: [{ book: "Romans", chapter: 1, verse: 7 }, { book: "Acts", chapter: 28, verse: 16 }] },
  { id: "patmos", name: "Patmos", modernName: "Patmos, Greece", lon: 26.550, lat: 37.316, periods: ["NT"], dateRange: { from: 95, to: 95 }, description: "The small Aegean island where John received the Revelation of Jesus Christ.", passages: [{ book: "Revelation", chapter: 1, verse: 9 }] },
];

export const LOCATION_BY_ID = new Map(LOCATIONS.map((l) => [l.id, l]));

// ── Journeys ──────────────────────────────────────────────────────────

export type Journey = {
  id: string;
  name: string;
  description: string;
  period: Period;
  dateLabel: string;
  color: string;
  /** Ordered location IDs forming the route line */
  routeLocationIds: string[];
  /** Key passages associated with the journey */
  keyPassages: Array<{ ref: string; label: string }>;
};

export const JOURNEYS: Journey[] = [
  {
    id: "abrahams-call",
    name: "Abraham's Call",
    description: "God called Abram out of Ur to a land He would show him. The journey of faith from Mesopotamia through Haran to the Promised Land — Shechem, Bethel, Hebron, and the Negev.",
    period: "Patriarchal",
    dateLabel: "c. 2091–2066 BC",
    color: "#92400E",
    routeLocationIds: ["ur", "haran", "damascus", "shechem", "bethel", "hebron", "beersheba"],
    keyPassages: [
      { ref: "Genesis 12:1–3", label: "The call and the promise" },
      { ref: "Genesis 12:6–7", label: "First altar at Shechem" },
      { ref: "Genesis 13:14–17", label: "The land promised again at Bethel" },
      { ref: "Genesis 15:5–6", label: "Covenant at Hebron — believed and credited as righteousness" },
      { ref: "Genesis 22:1–14", label: "The binding of Isaac" },
    ],
  },
  {
    id: "the-exodus",
    name: "The Exodus",
    description: "God delivered Israel from 430 years of bondage in Egypt with mighty signs. Through the Red Sea, to Sinai for the Law, and through the wilderness to the edge of the Promised Land.",
    period: "Exodus",
    dateLabel: "c. 1446–1406 BC",
    color: "#713F12",
    routeLocationIds: ["goshen", "red-sea", "sinai", "kadesh-barnea"],
    keyPassages: [
      { ref: "Exodus 12:31–42", label: "Departure from Egypt" },
      { ref: "Exodus 14:21–31", label: "Crossing the Red Sea" },
      { ref: "Exodus 19–20", label: "The Law given at Sinai" },
      { ref: "Numbers 13:25–33", label: "The 12 spies and the refusal to enter" },
      { ref: "Deuteronomy 34:1–5", label: "Moses sees the Promised Land" },
    ],
  },
  {
    id: "conquest-of-canaan",
    name: "Conquest of Canaan",
    description: "Under Joshua's leadership, Israel crossed the Jordan, conquered Jericho, and took the land God had promised — from Jericho through the central highlands to Hazor in the north.",
    period: "Conquest",
    dateLabel: "c. 1406–1375 BC",
    color: "#7F1D1D",
    routeLocationIds: ["jericho", "bethel", "hebron", "jerusalem", "shechem", "hazor", "dan"],
    keyPassages: [
      { ref: "Joshua 3:14–17", label: "Crossing the Jordan" },
      { ref: "Joshua 6:20", label: "The walls of Jericho fall" },
      { ref: "Joshua 10:12–14", label: "The sun stands still at Gibeon" },
      { ref: "Joshua 11:10–11", label: "Hazor burned" },
      { ref: "Joshua 24:1–15", label: "Covenant renewal at Shechem — 'choose this day'" },
    ],
  },
  {
    id: "jacobs-journey",
    name: "Jacob's Journey",
    description: "Fleeing Esau's wrath, Jacob traveled from Beersheba to Haran — seeing the ladder to heaven at Bethel along the way. After 20 years with Laban he returned, wrestling with God at the Jabbok and reconciling with Esau.",
    period: "Patriarchal",
    dateLabel: "c. 1929–1876 BC",
    color: "#6B21A8",
    routeLocationIds: ["beersheba", "bethel", "shechem", "haran", "shechem", "bethel", "hebron"],
    keyPassages: [
      { ref: "Genesis 28:10–22", label: "Jacob's ladder at Bethel" },
      { ref: "Genesis 29:1–30", label: "20 years serving Laban in Haran" },
      { ref: "Genesis 32:22–32", label: "Wrestling with God at the Jabbok — renamed Israel" },
      { ref: "Genesis 33:1–4", label: "Reconciliation with Esau" },
      { ref: "Genesis 35:1–15", label: "Return to Bethel — God confirms the covenant" },
    ],
  },
  {
    id: "into-exile",
    name: "Into Exile",
    description: "Because of persistent idolatry, God allowed Babylon to conquer Jerusalem. The temple was destroyed, and the people were carried into captivity — yet the prophets promised a return.",
    period: "Exile",
    dateLabel: "c. 605–538 BC",
    color: "#1E3A5F",
    routeLocationIds: ["jerusalem", "nineveh", "babylon"],
    keyPassages: [
      { ref: "2 Kings 25:1–12", label: "Fall of Jerusalem and temple destruction" },
      { ref: "Psalm 137:1–4", label: "'By the waters of Babylon we wept'" },
      { ref: "Daniel 1:1–6", label: "Daniel taken to Babylon" },
      { ref: "Jeremiah 29:10–14", label: "Promise of return after 70 years" },
      { ref: "Ezra 1:1–4", label: "Cyrus' decree to rebuild the temple" },
    ],
  },
  {
    id: "return-from-exile",
    name: "Return from Exile",
    description: "After 70 years in Babylon, Cyrus decreed that the Jews could return. Zerubbabel led the first wave to rebuild the temple; Ezra brought the Law; Nehemiah rebuilt the walls of Jerusalem.",
    period: "Return",
    dateLabel: "c. 538–445 BC",
    color: "#0F766E",
    routeLocationIds: ["babylon", "jerusalem"],
    keyPassages: [
      { ref: "Ezra 1:1–4", label: "Cyrus' decree — 'Let him go up'" },
      { ref: "Ezra 3:10–13", label: "Foundation of the second temple laid" },
      { ref: "Ezra 7:6–10", label: "Ezra brings the Law to Jerusalem" },
      { ref: "Nehemiah 2:1–8", label: "Nehemiah's commission to rebuild the walls" },
      { ref: "Nehemiah 8:1–8", label: "Ezra reads the Law to the people" },
    ],
  },
  {
    id: "jesus-life",
    name: "Life of Jesus",
    description: "Born in Bethlehem, raised in Nazareth, baptized in the Jordan, ministering in Galilee, and completing his work in Jerusalem — the life that changed everything.",
    period: "NT",
    dateLabel: "c. 5 BC – AD 30",
    color: "#92400E",
    routeLocationIds: ["bethlehem", "nazareth", "capernaum", "sea-galilee", "jericho", "bethel", "jerusalem"],
    keyPassages: [
      { ref: "Luke 2:4–7", label: "Born in Bethlehem" },
      { ref: "Luke 2:39–40", label: "Raised in Nazareth" },
      { ref: "Mark 1:14–20", label: "Ministry begins in Galilee" },
      { ref: "Matthew 16:13–20", label: "Peter's confession at Caesarea Philippi" },
      { ref: "Luke 19:28–44", label: "Triumphal entry into Jerusalem" },
      { ref: "Luke 23:33–46", label: "Crucifixion" },
      { ref: "Luke 24:1–8", label: "Resurrection" },
    ],
  },
  {
    id: "road-to-damascus",
    name: "Road to Damascus",
    description: "Saul of Tarsus set out from Jerusalem breathing threats against the church. On the road to Damascus a blinding light and the voice of Jesus stopped him. He entered the city blind and left as Paul the apostle.",
    period: "NT",
    dateLabel: "c. AD 33–35",
    color: "#DC2626",
    routeLocationIds: ["jerusalem", "damascus"],
    keyPassages: [
      { ref: "Acts 9:1–9", label: "The blinding light on the road" },
      { ref: "Acts 9:10–19", label: "Ananias restores Saul's sight" },
      { ref: "Acts 9:20–25", label: "Saul preaches Christ in Damascus" },
      { ref: "Galatians 1:15–17", label: "Paul's own account of his calling" },
    ],
  },
  {
    id: "paul-1",
    name: "Paul's First Journey",
    description: "Sent from Antioch by the Holy Spirit, Paul and Barnabas sailed to Cyprus, then pushed into the rugged interior of Asia Minor — Pisidian Antioch, Iconium, Lystra, and Derbe — before retracing their steps home.",
    period: "NT",
    dateLabel: "c. AD 46–48",
    color: "#92400E",
    routeLocationIds: ["antioch-syria", "salamis", "paphos", "perga", "pisidian-antioch", "iconium", "lystra", "derbe"],
    keyPassages: [
      { ref: "Acts 13:2–3", label: "Set apart by the Holy Spirit at Antioch" },
      { ref: "Acts 13:6–12", label: "Sergius Paulus believes in Paphos" },
      { ref: "Acts 13:16–41", label: "Paul's sermon at Pisidian Antioch" },
      { ref: "Acts 14:8–18", label: "Healing and near-worship at Lystra" },
      { ref: "Acts 14:19–20", label: "Paul stoned at Lystra" },
    ],
  },
  {
    id: "paul-2",
    name: "Paul's Second Journey",
    description: "A vision of a Macedonian man calling 'Come help us' sent Paul across the Aegean into Europe for the first time. From Philippi to Thessalonica, Athens, and Corinth — the gospel leapt continents.",
    period: "NT",
    dateLabel: "c. AD 49–52",
    color: "#1E3A5F",
    routeLocationIds: ["antioch-syria", "derbe", "lystra", "iconium", "troas", "philippi", "thessalonica", "berea", "athens", "corinth", "ephesus", "caesarea", "jerusalem"],
    keyPassages: [
      { ref: "Acts 16:1–3", label: "Timothy joins at Lystra" },
      { ref: "Acts 16:9–10", label: "Macedonian vision at Troas" },
      { ref: "Acts 16:13–15", label: "Lydia converted at Philippi" },
      { ref: "Acts 17:10–12", label: "Noble Bereans search the Scriptures" },
      { ref: "Acts 17:22–31", label: "Areopagus sermon in Athens" },
      { ref: "Acts 18:1–11", label: "18 months in Corinth" },
    ],
  },
  {
    id: "paul-3",
    name: "Paul's Third Journey",
    description: "Three years in Ephesus shook Asia Minor. Then through Macedonia and Greece collecting the offering for Jerusalem — ending with a tearful farewell to the Ephesian elders at Miletus.",
    period: "NT",
    dateLabel: "c. AD 53–57",
    color: "#0F766E",
    routeLocationIds: ["antioch-syria", "derbe", "lystra", "iconium", "ephesus", "troas", "philippi", "corinth", "philippi", "troas", "miletus", "tyre", "caesarea", "jerusalem"],
    keyPassages: [
      { ref: "Acts 19:8–10", label: "Two years in Ephesus — all Asia hears" },
      { ref: "Acts 19:23–41", label: "Silversmiths' riot in Ephesus" },
      { ref: "Acts 20:7–12", label: "Eutychus falls from the window in Troas" },
      { ref: "Acts 20:17–38", label: "Farewell to the Ephesian elders at Miletus" },
      { ref: "Acts 21:10–14", label: "Agabus prophesies Paul's arrest at Caesarea" },
    ],
  },
  {
    id: "paul-to-rome",
    name: "Paul's Journey to Rome",
    description: "Arrested in Jerusalem and imprisoned in Caesarea for two years, Paul appealed to Caesar. The voyage to Rome brought shipwreck at Malta, but finally the apostle arrived in the capital of the world.",
    period: "NT",
    dateLabel: "c. AD 59–61",
    color: "#6B21A8",
    routeLocationIds: ["jerusalem", "caesarea", "crete", "malta", "rome"],
    keyPassages: [
      { ref: "Acts 25:10–12", label: "Paul appeals to Caesar" },
      { ref: "Acts 27:13–44", label: "The shipwreck" },
      { ref: "Acts 28:1–6", label: "Viper at Malta — Paul unharmed" },
      { ref: "Acts 28:30–31", label: "Two years preaching in Rome under house arrest" },
    ],
  },
];
