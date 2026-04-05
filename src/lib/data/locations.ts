/**
 * Biblical geography — key locations with coordinates, period, and representative passages.
 * Not exhaustive; curated to cover the places that matter for study.
 */

export type Period =
  | "Patriarchal"
  | "Exodus"
  | "Conquest"
  | "Monarchy"
  | "Exile"
  | "NT"
  | "Return";

export type Location = {
  id: string;
  name: string;
  modernName?: string;
  lon: number;
  lat: number;
  periods: Period[];
  description: string;
  passages: Array<{ book: string; chapter: number; verse?: number }>;
};

export const LOCATIONS: Location[] = [
  // ── Patriarchal ──
  { id: "ur", name: "Ur of the Chaldeans", modernName: "Tell el-Muqayyar, Iraq", lon: 46.103, lat: 30.963, periods: ["Patriarchal"], description: "The ancient Sumerian city where Abram was born, and from which God called him to the land of Canaan.", passages: [{ book: "Genesis", chapter: 11, verse: 31 }, { book: "Nehemiah", chapter: 9, verse: 7 }] },
  { id: "haran", name: "Haran", modernName: "Harran, Turkey", lon: 39.032, lat: 36.866, periods: ["Patriarchal"], description: "The way-station where Terah settled and where Abram received the second call to Canaan.", passages: [{ book: "Genesis", chapter: 11, verse: 31 }, { book: "Genesis", chapter: 12, verse: 4 }] },
  { id: "shechem", name: "Shechem", modernName: "Nablus, West Bank", lon: 35.266, lat: 32.213, periods: ["Patriarchal", "Conquest", "Monarchy"], description: "Abram's first stop in Canaan, where he built an altar. Later the covenant renewal site under Joshua and the place where the kingdom divided under Rehoboam.", passages: [{ book: "Genesis", chapter: 12, verse: 6 }, { book: "Joshua", chapter: 24, verse: 1 }, { book: "1 Kings", chapter: 12 }] },
  { id: "bethel", name: "Bethel", modernName: "Beitin, West Bank", lon: 35.240, lat: 31.930, periods: ["Patriarchal", "Conquest", "Monarchy"], description: "House of God — where Jacob saw the ladder. Later a center of false worship under Jeroboam.", passages: [{ book: "Genesis", chapter: 28, verse: 19 }, { book: "1 Kings", chapter: 12, verse: 29 }] },
  { id: "hebron", name: "Hebron", modernName: "Hebron, West Bank", lon: 35.095, lat: 31.532, periods: ["Patriarchal", "Conquest", "Monarchy"], description: "Abraham settled here under the oaks of Mamre. Later David's first capital before Jerusalem.", passages: [{ book: "Genesis", chapter: 13, verse: 18 }, { book: "2 Samuel", chapter: 2, verse: 1 }] },
  { id: "beersheba", name: "Beersheba", modernName: "Beer Sheva, Israel", lon: 34.791, lat: 31.252, periods: ["Patriarchal"], description: "The 'well of seven' — the southern boundary of the Promised Land and a place of covenant oaths.", passages: [{ book: "Genesis", chapter: 21, verse: 31 }, { book: "Genesis", chapter: 26, verse: 33 }] },

  // ── Exodus ──
  { id: "goshen", name: "Goshen", modernName: "Eastern Nile delta, Egypt", lon: 31.900, lat: 30.500, periods: ["Patriarchal", "Exodus"], description: "The fertile region of the Nile delta where Israel settled under Joseph and multiplied into a great nation before the Exodus.", passages: [{ book: "Genesis", chapter: 47, verse: 6 }, { book: "Exodus", chapter: 8, verse: 22 }] },
  { id: "sinai", name: "Mount Sinai", modernName: "Jebel Musa (traditional), Sinai Peninsula", lon: 33.973, lat: 28.539, periods: ["Exodus"], description: "The mountain of God where the Law was given and the covenant established with Israel.", passages: [{ book: "Exodus", chapter: 19 }, { book: "Exodus", chapter: 24 }] },
  { id: "red-sea", name: "Red Sea crossing", modernName: "Northern Gulf of Suez (traditional)", lon: 32.550, lat: 29.900, periods: ["Exodus"], description: "The miraculous crossing that marks Israel's deliverance from Egyptian bondage.", passages: [{ book: "Exodus", chapter: 14 }] },
  { id: "kadesh-barnea", name: "Kadesh Barnea", modernName: "Ein el-Qudeirat, Sinai", lon: 34.415, lat: 30.673, periods: ["Exodus"], description: "Where the twelve spies were sent out and where Israel refused to enter the land — the starting point of 38 years of wandering.", passages: [{ book: "Numbers", chapter: 13, verse: 26 }, { book: "Deuteronomy", chapter: 1, verse: 19 }] },

  // ── Conquest / Monarchy ──
  { id: "jericho", name: "Jericho", modernName: "Tell es-Sultan, West Bank", lon: 35.444, lat: 31.871, periods: ["Conquest", "NT"], description: "The first city taken in the Conquest — walls falling at the sound of the trumpet. Also the city where Jesus healed Bartimaeus and met Zacchaeus.", passages: [{ book: "Joshua", chapter: 6 }, { book: "Luke", chapter: 19, verse: 1 }] },
  { id: "jerusalem", name: "Jerusalem", modernName: "Jerusalem, Israel", lon: 35.2137, lat: 31.7683, periods: ["Monarchy", "Exile", "NT", "Return"], description: "The city of David, Zion, the city of the great King. Site of Solomon's temple, the crucifixion and resurrection, and Pentecost.", passages: [{ book: "2 Samuel", chapter: 5, verse: 6 }, { book: "Luke", chapter: 23 }, { book: "Acts", chapter: 2 }] },
  { id: "bethlehem", name: "Bethlehem", modernName: "Bethlehem, West Bank", lon: 35.200, lat: 31.705, periods: ["Patriarchal", "Monarchy", "NT"], description: "The town of David, prophesied as the birthplace of the Messiah. Where Ruth met Boaz and where Jesus was born.", passages: [{ book: "Ruth", chapter: 1, verse: 22 }, { book: "Micah", chapter: 5, verse: 2 }, { book: "Luke", chapter: 2, verse: 4 }] },
  { id: "samaria", name: "Samaria", modernName: "Sebastia, West Bank", lon: 35.191, lat: 32.276, periods: ["Monarchy", "Exile", "NT"], description: "Capital of the northern kingdom built by Omri. Later home of the Samaritans of New Testament times.", passages: [{ book: "1 Kings", chapter: 16, verse: 24 }, { book: "John", chapter: 4, verse: 4 }] },
  { id: "nineveh", name: "Nineveh", modernName: "Mosul, Iraq", lon: 43.148, lat: 36.359, periods: ["Monarchy", "Exile"], description: "The great city of Assyria — Jonah's reluctant mission, Nahum's oracle of judgment.", passages: [{ book: "Jonah", chapter: 3, verse: 3 }, { book: "Nahum", chapter: 1 }] },
  { id: "babylon", name: "Babylon", modernName: "Hillah, Iraq", lon: 44.420, lat: 32.542, periods: ["Exile", "Return"], description: "The empire that destroyed Jerusalem in 586 BC and carried Judah into exile. Daniel served three kings here.", passages: [{ book: "2 Kings", chapter: 25 }, { book: "Daniel", chapter: 1 }] },

  // ── New Testament ──
  { id: "nazareth", name: "Nazareth", modernName: "Nazareth, Israel", lon: 35.302, lat: 32.702, periods: ["NT"], description: "The hill town in Galilee where Jesus was raised — obscure enough that Nathanael asked, 'Can anything good come out of Nazareth?'", passages: [{ book: "Luke", chapter: 2, verse: 39 }, { book: "John", chapter: 1, verse: 46 }] },
  { id: "capernaum", name: "Capernaum", modernName: "Kfar Nahum, Israel", lon: 35.574, lat: 32.880, periods: ["NT"], description: "Jesus' adopted hometown during his Galilean ministry, on the north shore of the Sea of Galilee.", passages: [{ book: "Matthew", chapter: 4, verse: 13 }, { book: "Mark", chapter: 2, verse: 1 }] },
  { id: "sea-galilee", name: "Sea of Galilee", modernName: "Lake Kinneret, Israel", lon: 35.589, lat: 32.820, periods: ["NT"], description: "A freshwater lake, the setting for much of Jesus' teaching, his calling of fishermen, and his walking on the water.", passages: [{ book: "Matthew", chapter: 14, verse: 25 }, { book: "Luke", chapter: 5 }] },
  { id: "antioch-syria", name: "Antioch (Syria)", modernName: "Antakya, Turkey", lon: 36.201, lat: 36.202, periods: ["NT"], description: "Where disciples were first called Christians and where Paul and Barnabas were sent out on the first missionary journey.", passages: [{ book: "Acts", chapter: 11, verse: 26 }, { book: "Acts", chapter: 13, verse: 2 }] },
  { id: "ephesus", name: "Ephesus", modernName: "Selçuk, Turkey", lon: 27.341, lat: 37.941, periods: ["NT"], description: "Paul's long-term ministry base in Asia Minor, and one of the seven churches of Revelation.", passages: [{ book: "Acts", chapter: 19 }, { book: "Ephesians", chapter: 1 }, { book: "Revelation", chapter: 2, verse: 1 }] },
  { id: "philippi", name: "Philippi", modernName: "Philippoi, Greece", lon: 24.287, lat: 41.013, periods: ["NT"], description: "The first European city where Paul preached the gospel — Lydia's heart was opened here.", passages: [{ book: "Acts", chapter: 16, verse: 12 }, { book: "Philippians", chapter: 1 }] },
  { id: "corinth", name: "Corinth", modernName: "Archaia Korinthos, Greece", lon: 22.880, lat: 37.906, periods: ["NT"], description: "A wealthy, cosmopolitan port where Paul stayed 18 months and to which he wrote two of his most personal letters.", passages: [{ book: "Acts", chapter: 18 }, { book: "1 Corinthians", chapter: 1 }] },
  { id: "athens", name: "Athens", modernName: "Athens, Greece", lon: 23.728, lat: 37.984, periods: ["NT"], description: "Where Paul preached to the philosophers on the Areopagus, quoting their own poets.", passages: [{ book: "Acts", chapter: 17, verse: 22 }] },
  { id: "rome", name: "Rome", modernName: "Rome, Italy", lon: 12.496, lat: 41.902, periods: ["NT"], description: "The capital of the Empire. Paul appealed to Caesar and wrote his letter to the believers there. Tradition holds that both Peter and Paul were martyred here.", passages: [{ book: "Romans", chapter: 1, verse: 7 }, { book: "Acts", chapter: 28, verse: 16 }] },
  { id: "patmos", name: "Patmos", modernName: "Patmos, Greece", lon: 26.550, lat: 37.316, periods: ["NT"], description: "The small Aegean island where John received the Revelation of Jesus Christ.", passages: [{ book: "Revelation", chapter: 1, verse: 9 }] },
];

export type Route = {
  id: string;
  name: string;
  color: string;
  description: string;
  locationIds: string[];
};

export const ROUTES: Route[] = [
  {
    id: "paul-1",
    name: "Paul's First Journey",
    color: "#92400E",
    description: "Antioch → Cyprus → Galatia and back. c. AD 46–48.",
    locationIds: ["antioch-syria"],
  },
  {
    id: "paul-2",
    name: "Paul's Second Journey",
    color: "#1E3A5F",
    description: "Antioch → Galatia → Macedonia → Greece → Ephesus. c. AD 49–52.",
    locationIds: ["antioch-syria", "philippi", "athens", "corinth", "ephesus"],
  },
  {
    id: "paul-3",
    name: "Paul's Third Journey",
    color: "#0F766E",
    description: "Antioch → Galatia → Ephesus (three years) → Macedonia → Jerusalem. c. AD 53–57.",
    locationIds: ["antioch-syria", "ephesus", "corinth", "philippi", "jerusalem"],
  },
  {
    id: "exodus",
    name: "Exodus Route (traditional)",
    color: "#713F12",
    description: "Goshen → Red Sea → Sinai → Kadesh Barnea → Jordan.",
    locationIds: ["goshen", "red-sea", "sinai", "kadesh-barnea", "jericho"],
  },
  {
    id: "conquest",
    name: "Conquest of Canaan",
    color: "#7F1D1D",
    description: "Crossing the Jordan at Jericho, south to Jerusalem, north to Hazor.",
    locationIds: ["jericho", "bethel", "jerusalem", "hebron", "shechem"],
  },
];
