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
  /** Optional atlas location ID — used by the atlas timeline dropdown to fly to a place */
  locationId?: string;
};

export const TIMELINE_EVENTS: TimelineEvent[] = [
  // ── Pre-Patriarchal ──
  { id: "creation", name: "Creation", year: -4004, epochId: "patriarchs", importance: 3, passage: { book: "Genesis", chapter: 1 }, description: "In the beginning, God created the heavens and the earth." },
  { id: "fall", name: "The Fall", year: -4004, epochId: "patriarchs", importance: 2, passage: { book: "Genesis", chapter: 3 }, description: "Adam and Eve eat the forbidden fruit. Sin and death enter the world, but God promises a deliverer." },
  { id: "cain-abel", name: "Cain and Abel", year: -3900, epochId: "patriarchs", importance: 1, passage: { book: "Genesis", chapter: 4 }, description: "The first murder — Cain kills his brother Abel out of jealousy over God's acceptance of Abel's offering." },
  { id: "enoch", name: "Enoch walks with God", year: -3300, epochId: "patriarchs", importance: 1, passage: { book: "Genesis", chapter: 5, verseStart: 24 }, description: "Enoch walked faithfully with God; then he was no more, because God took him away." },
  { id: "flood", name: "The Flood", year: -2348, epochId: "patriarchs", importance: 2, passage: { book: "Genesis", chapter: 7 }, description: "Noah and his family preserved through the waters of judgment." },
  { id: "babel", name: "Tower of Babel", year: -2200, epochId: "patriarchs", importance: 1, passage: { book: "Genesis", chapter: 11 }, description: "Languages confused; the nations scattered." },

  // ── Patriarchal ──
  { id: "abraham-called", name: "Abraham called", year: -2091, epochId: "patriarchs", importance: 3, passage: { book: "Genesis", chapter: 12, verseStart: 1 }, description: "'Go from your country… and I will make of you a great nation.'", locationId: "ur" },
  { id: "abraham-lot-separate", name: "Abraham and Lot separate", year: -2080, epochId: "patriarchs", importance: 1, passage: { book: "Genesis", chapter: 13 }, description: "Abraham settles in Hebron under the oaks of Mamre; Lot chooses the well-watered Jordan plain.", locationId: "hebron" },
  { id: "sodom-gomorrah", name: "Sodom and Gomorrah destroyed", year: -2067, epochId: "patriarchs", importance: 1, passage: { book: "Genesis", chapter: 19 }, description: "God rains fire on the cities of the plain. Lot escapes; his wife looks back." },
  { id: "isaac-born", name: "Isaac born", year: -2066, epochId: "patriarchs", importance: 1, passage: { book: "Genesis", chapter: 21 }, description: "The child of promise, born when Abraham is 100.", locationId: "beersheba" },
  { id: "binding-isaac", name: "The binding of Isaac", year: -2050, epochId: "patriarchs", importance: 2, passage: { book: "Genesis", chapter: 22 }, description: "God tests Abraham on Mount Moriah — 'The LORD will provide.'", locationId: "jerusalem" },
  { id: "jacob-esau", name: "Jacob and Esau born", year: -2006, epochId: "patriarchs", importance: 1, passage: { book: "Genesis", chapter: 25, verseStart: 24 }, description: "Twin sons born to Isaac and Rebekah. Esau sells his birthright for a bowl of stew." },
  { id: "jacobs-ladder", name: "Jacob's ladder at Bethel", year: -1929, epochId: "patriarchs", importance: 1, passage: { book: "Genesis", chapter: 28, verseStart: 12 }, description: "Fleeing Esau, Jacob sees a stairway to heaven and God renews the Abrahamic promise.", locationId: "bethel" },
  { id: "jacob-wrestles", name: "Jacob wrestles with God", year: -1909, epochId: "patriarchs", importance: 2, passage: { book: "Genesis", chapter: 32, verseStart: 24 }, description: "At the Jabbok, Jacob wrestles until dawn and is renamed Israel — 'he who strives with God.'" },

  // ── Egypt & Exodus ──
  { id: "joseph-egypt", name: "Joseph sold into Egypt", year: -1898, epochId: "egypt-exodus", importance: 1, passage: { book: "Genesis", chapter: 37 }, description: "God preserves the covenant family by sending Joseph ahead." },
  { id: "joseph-ruler", name: "Joseph becomes ruler of Egypt", year: -1885, epochId: "egypt-exodus", importance: 1, passage: { book: "Genesis", chapter: 41, verseStart: 41 }, description: "From prison to Pharaoh's right hand — Joseph saves Egypt and his family from famine.", locationId: "goshen" },
  { id: "israel-enters-egypt", name: "Jacob's family enters Egypt", year: -1876, epochId: "egypt-exodus", importance: 1, passage: { book: "Genesis", chapter: 46 }, description: "Seventy souls go down to Egypt. They will leave as a nation of millions.", locationId: "goshen" },
  { id: "moses-born", name: "Moses born", year: -1526, epochId: "egypt-exodus", importance: 1, passage: { book: "Exodus", chapter: 2 }, description: "Hidden in a basket among the reeds, drawn out by Pharaoh's daughter." },
  { id: "burning-bush", name: "The burning bush", year: -1446, epochId: "egypt-exodus", importance: 2, passage: { book: "Exodus", chapter: 3 }, description: "'I AM WHO I AM' — God commissions Moses to deliver Israel from Egypt.", locationId: "sinai" },
  { id: "ten-plagues", name: "Ten plagues on Egypt", year: -1446, epochId: "egypt-exodus", importance: 2, passage: { book: "Exodus", chapter: 7 }, description: "Blood, frogs, gnats, flies, livestock disease, boils, hail, locusts, darkness, death of firstborn." },
  { id: "exodus", name: "The Exodus", year: -1446, epochId: "egypt-exodus", importance: 3, passage: { book: "Exodus", chapter: 12 }, description: "Passover and the deliverance from Egypt under Moses.", locationId: "goshen" },
  { id: "red-sea-crossing", name: "Red Sea crossing", year: -1446, epochId: "egypt-exodus", importance: 2, passage: { book: "Exodus", chapter: 14 }, description: "The waters part — Israel walks through on dry ground; Pharaoh's army is swallowed.", locationId: "red-sea" },
  { id: "sinai", name: "Law given at Sinai", year: -1446, epochId: "egypt-exodus", importance: 3, passage: { book: "Exodus", chapter: 19 }, description: "The covenant with Israel, the Ten Commandments, the tabernacle pattern.", locationId: "sinai" },
  { id: "golden-calf", name: "The golden calf", year: -1446, epochId: "egypt-exodus", importance: 1, passage: { book: "Exodus", chapter: 32 }, description: "While Moses is on the mountain, Israel worships an idol. Three thousand die that day." },
  { id: "twelve-spies", name: "12 spies sent into Canaan", year: -1445, epochId: "egypt-exodus", importance: 1, passage: { book: "Numbers", chapter: 13 }, description: "Ten spies see giants; only Joshua and Caleb trust God. Israel is sentenced to 40 years.", locationId: "kadesh-barnea" },
  { id: "death-of-moses", name: "Death of Moses", year: -1406, epochId: "egypt-exodus", importance: 1, passage: { book: "Deuteronomy", chapter: 34 }, description: "Moses sees the Promised Land from Mount Nebo but does not enter. Joshua takes command." },

  // ── Conquest ──
  { id: "jordan-crossing", name: "Israel crosses the Jordan", year: -1406, epochId: "conquest", importance: 2, passage: { book: "Joshua", chapter: 3 }, description: "The waters of the Jordan stand in a heap; Israel enters the Promised Land on dry ground.", locationId: "jericho" },
  { id: "conquest-jericho", name: "Conquest of Jericho", year: -1406, epochId: "conquest", importance: 2, passage: { book: "Joshua", chapter: 6 }, description: "The walls fall at the trumpet's sound.", locationId: "jericho" },
  { id: "sun-stands-still", name: "Sun stands still at Gibeon", year: -1405, epochId: "conquest", importance: 1, passage: { book: "Joshua", chapter: 10, verseStart: 12 }, description: "God fights for Israel — the sun stops in the sky until victory is complete." },
  { id: "land-divided", name: "Land divided among the tribes", year: -1399, epochId: "conquest", importance: 1, passage: { book: "Joshua", chapter: 14 }, description: "Each tribe receives its inheritance. The land has rest from war." },
  { id: "covenant-shechem", name: "Covenant renewal at Shechem", year: -1390, epochId: "conquest", importance: 2, passage: { book: "Joshua", chapter: 24 }, description: "'Choose this day whom you will serve… As for me and my house, we will serve the LORD.'", locationId: "shechem" },

  // ── Judges ──
  { id: "judges-begin", name: "Cycles of the Judges begin", year: -1350, epochId: "judges", importance: 1, passage: { book: "Judges", chapter: 2, verseStart: 11 }, description: "Israel does what is right in their own eyes." },
  { id: "deborah-barak", name: "Deborah and Barak defeat Sisera", year: -1209, epochId: "judges", importance: 1, passage: { book: "Judges", chapter: 4 }, description: "The prophetess and the general rout the Canaanite army. Jael drives a tent peg through Sisera's temple." },
  { id: "gideon", name: "Gideon's 300 defeat Midian", year: -1162, epochId: "judges", importance: 1, passage: { book: "Judges", chapter: 7 }, description: "God pares Israel's army down to 300 men with torches and trumpets — so no one can boast." },
  { id: "samson", name: "Samson judges Israel", year: -1075, epochId: "judges", importance: 1, passage: { book: "Judges", chapter: 14 }, description: "The strongest man in Israel, undone by Delilah, redeemed in death as he brings down the Philistine temple." },
  { id: "ruth-boaz", name: "Ruth and Boaz", year: -1100, epochId: "judges", importance: 1, passage: { book: "Ruth", chapter: 4 }, description: "A Moabite widow becomes an ancestor of King David and of the Messiah — grace crossing every boundary.", locationId: "bethlehem" },

  // ── United Kingdom ──
  { id: "samuel", name: "Samuel anoints Saul", year: -1050, epochId: "united-kingdom", importance: 1, passage: { book: "1 Samuel", chapter: 10 }, description: "Israel's first king." },
  { id: "david-goliath", name: "David defeats Goliath", year: -1024, epochId: "united-kingdom", importance: 1, passage: { book: "1 Samuel", chapter: 17 }, description: "A shepherd boy with five stones and the name of the LORD defeats the Philistine champion." },
  { id: "david-crowned", name: "David crowned over Israel", year: -1010, epochId: "united-kingdom", importance: 2, passage: { book: "2 Samuel", chapter: 5 }, description: "The shepherd-king begins his 40-year reign.", locationId: "hebron" },
  { id: "ark-to-jerusalem", name: "Ark brought to Jerusalem", year: -1005, epochId: "united-kingdom", importance: 1, passage: { book: "2 Samuel", chapter: 6 }, description: "David dances before the LORD as the ark enters Jerusalem.", locationId: "jerusalem" },
  { id: "davidic-covenant", name: "Davidic Covenant", year: -1003, epochId: "united-kingdom", importance: 3, passage: { book: "2 Samuel", chapter: 7 }, description: "'Your throne shall be established forever.'", locationId: "jerusalem" },
  { id: "solomon-wisdom", name: "Solomon asks for wisdom", year: -970, epochId: "united-kingdom", importance: 1, passage: { book: "1 Kings", chapter: 3, verseStart: 9 }, description: "'Give your servant an understanding heart to judge your people.' God grants wisdom and riches." },
  { id: "temple-built", name: "Solomon's Temple completed", year: -960, epochId: "united-kingdom", importance: 2, passage: { book: "1 Kings", chapter: 8 }, description: "The glory of the LORD fills the temple.", locationId: "jerusalem" },
  { id: "proverbs-written", name: "Proverbs and Song of Songs", year: -950, epochId: "united-kingdom", importance: 1, passage: { book: "Proverbs", chapter: 1 }, description: "Solomon composes 3,000 proverbs and 1,005 songs — Israel's golden age of wisdom literature." },

  // ── Divided Kingdom ──
  { id: "kingdom-divided", name: "Kingdom divides", year: -930, epochId: "divided-kingdom", importance: 2, passage: { book: "1 Kings", chapter: 12 }, description: "Rehoboam in Judah, Jeroboam in Israel.", locationId: "shechem" },
  { id: "ahab-jezebel", name: "Ahab and Jezebel reign", year: -874, epochId: "divided-kingdom", importance: 1, passage: { book: "1 Kings", chapter: 16, verseStart: 30 }, description: "The worst king of Israel and his Sidonian queen bring Baal worship to its peak.", locationId: "samaria" },
  { id: "elijah", name: "Elijah on Mount Carmel", year: -860, epochId: "divided-kingdom", importance: 1, passage: { book: "1 Kings", chapter: 18 }, description: "'The LORD, he is God!'" },
  { id: "elisha", name: "Elisha succeeds Elijah", year: -848, epochId: "divided-kingdom", importance: 1, passage: { book: "2 Kings", chapter: 2 }, description: "Elijah is taken up in a chariot of fire. Elisha receives a double portion of his spirit." },
  { id: "jonah", name: "Jonah sent to Nineveh", year: -780, epochId: "divided-kingdom", importance: 1, passage: { book: "Jonah", chapter: 1 }, description: "The reluctant prophet flees, survives the great fish, and preaches — and Nineveh repents.", locationId: "nineveh" },
  { id: "amos-hosea", name: "Amos and Hosea prophesy", year: -760, epochId: "divided-kingdom", importance: 1, passage: { book: "Amos", chapter: 1 }, description: "Amos thunders justice; Hosea enacts God's heartbroken love for unfaithful Israel." },
  { id: "isaiah-call", name: "Isaiah's call", year: -740, epochId: "divided-kingdom", importance: 1, passage: { book: "Isaiah", chapter: 6 }, description: "'Whom shall I send, and who will go for us?'" },
  { id: "samaria-falls", name: "Samaria falls to Assyria", year: -722, epochId: "judah-alone", importance: 2, passage: { book: "2 Kings", chapter: 17 }, description: "The northern kingdom taken into exile.", locationId: "samaria" },

  // ── Judah Alone ──
  { id: "hezekiah-sennacherib", name: "Hezekiah's prayer defeats Sennacherib", year: -701, epochId: "judah-alone", importance: 1, passage: { book: "2 Kings", chapter: 19 }, description: "185,000 Assyrians struck down in one night. Jerusalem is delivered by prayer.", locationId: "jerusalem" },
  { id: "josiahs-reforms", name: "Josiah finds the Book of the Law", year: -622, epochId: "judah-alone", importance: 2, passage: { book: "2 Kings", chapter: 22 }, description: "The lost scroll of Deuteronomy is found in the temple. Josiah tears his robes and leads the greatest reform in Judah's history.", locationId: "jerusalem" },
  { id: "jeremiah-begins", name: "Jeremiah begins prophesying", year: -627, epochId: "judah-alone", importance: 1, passage: { book: "Jeremiah", chapter: 1 }, description: "'Before I formed you in the womb I knew you.' The weeping prophet warns Judah for 40 years.", locationId: "jerusalem" },

  // ── Exile ──
  { id: "daniel-deported", name: "Daniel taken to Babylon", year: -605, epochId: "exile", importance: 1, passage: { book: "Daniel", chapter: 1 }, description: "The first deportation under Nebuchadnezzar.", locationId: "babylon" },
  { id: "ezekiel-vision", name: "Ezekiel's vision of God's glory", year: -593, epochId: "exile", importance: 1, passage: { book: "Ezekiel", chapter: 1 }, description: "By the Chebar canal in Babylon, Ezekiel sees the throne-chariot of God." },
  { id: "jerusalem-falls", name: "Jerusalem falls to Babylon", year: -586, epochId: "exile", importance: 2, passage: { book: "2 Kings", chapter: 25 }, description: "The temple is destroyed and Judah goes into exile.", locationId: "jerusalem" },
  { id: "fiery-furnace", name: "The fiery furnace", year: -580, epochId: "exile", importance: 1, passage: { book: "Daniel", chapter: 3 }, description: "Shadrach, Meshach, and Abednego refuse to bow. A fourth figure walks with them in the fire.", locationId: "babylon" },
  { id: "dry-bones", name: "Ezekiel's valley of dry bones", year: -573, epochId: "exile", importance: 1, passage: { book: "Ezekiel", chapter: 37 }, description: "'Can these bones live?' God promises to breathe life into dead Israel and bring them home." },
  { id: "lions-den", name: "Daniel in the lion's den", year: -539, epochId: "exile", importance: 1, passage: { book: "Daniel", chapter: 6 }, description: "Daniel prays despite the decree. God shuts the lions' mouths.", locationId: "babylon" },

  // ── Return ──
  { id: "return-cyrus", name: "Cyrus's decree — return from exile", year: -538, epochId: "return", importance: 2, passage: { book: "Ezra", chapter: 1 }, description: "The LORD stirred up the spirit of Cyrus.", locationId: "babylon" },
  { id: "temple-rebuilt", name: "Second temple dedicated", year: -516, epochId: "return", importance: 1, passage: { book: "Ezra", chapter: 6, verseStart: 15 }, description: "Seventy years after its destruction, a house for God stands again.", locationId: "jerusalem" },
  { id: "esther", name: "Esther saves her people", year: -473, epochId: "return", importance: 1, passage: { book: "Esther", chapter: 4, verseStart: 14 }, description: "'Who knows whether you have come to the kingdom for such a time as this?'" },
  { id: "ezra-returns", name: "Ezra brings the Law to Jerusalem", year: -458, epochId: "return", importance: 1, passage: { book: "Ezra", chapter: 7 }, description: "Ezra the scribe leads a second wave of exiles home, carrying the Torah to teach the people.", locationId: "jerusalem" },
  { id: "nehemiah-walls", name: "Nehemiah rebuilds Jerusalem's walls", year: -445, epochId: "return", importance: 1, passage: { book: "Nehemiah", chapter: 2 }, description: "In 52 days, the walls go up despite mockery and threats — a cupbearer becomes a builder.", locationId: "jerusalem" },
  { id: "malachi", name: "Malachi — the last OT prophet", year: -430, epochId: "return", importance: 1, passage: { book: "Malachi", chapter: 1 }, description: "'Behold, I send my messenger…' Then silence — 400 years until John the Baptist." },

  // ── NT Era ──
  { id: "jesus-born", name: "Jesus born in Bethlehem", year: -4, epochId: "nt-era", importance: 3, passage: { book: "Luke", chapter: 2 }, description: "'For unto you is born this day in the city of David a Savior, who is Christ the Lord.'", locationId: "bethlehem" },
  { id: "john-baptist-born", name: "John the Baptist born", year: -5, epochId: "nt-era", importance: 1, passage: { book: "Luke", chapter: 1, verseStart: 57 }, description: "The forerunner of the Messiah — the voice crying in the wilderness." },
  { id: "jesus-ministry", name: "Ministry begins (baptism)", year: 27, epochId: "nt-era", importance: 2, passage: { book: "Matthew", chapter: 3 }, description: "'This is my beloved Son, with whom I am well pleased.'" },
  { id: "temptation", name: "Temptation in the wilderness", year: 27, epochId: "nt-era", importance: 1, passage: { book: "Matthew", chapter: 4 }, description: "Forty days. Three temptations. Jesus answers each with Scripture." },
  { id: "sermon-mount", name: "Sermon on the Mount", year: 28, epochId: "nt-era", importance: 2, passage: { book: "Matthew", chapter: 5 }, description: "'Blessed are the poor in spirit…' — the charter of the kingdom of God.", locationId: "sea-galilee" },
  { id: "feeding-5000", name: "Feeding the 5,000", year: 29, epochId: "nt-era", importance: 1, passage: { book: "John", chapter: 6 }, description: "Five loaves, two fish, and 12 baskets left over.", locationId: "sea-galilee" },
  { id: "transfiguration", name: "The Transfiguration", year: 29, epochId: "nt-era", importance: 1, passage: { book: "Matthew", chapter: 17 }, description: "Jesus' face shines like the sun on the mountain. Moses and Elijah appear beside him." },
  { id: "lazarus", name: "Raising of Lazarus", year: 30, epochId: "nt-era", importance: 1, passage: { book: "John", chapter: 11 }, description: "'Lazarus, come out!' — four days dead, and yet he walks out of the tomb.", locationId: "bethlehem" },
  { id: "triumphal-entry", name: "Triumphal entry into Jerusalem", year: 30, epochId: "nt-era", importance: 1, passage: { book: "Matthew", chapter: 21 }, description: "'Hosanna to the Son of David!' — Jesus enters Jerusalem on a donkey, fulfilling Zechariah's prophecy.", locationId: "jerusalem" },
  { id: "last-supper", name: "The Last Supper", year: 30, epochId: "nt-era", importance: 2, passage: { book: "Luke", chapter: 22 }, description: "'This cup is the new covenant in my blood.' Jesus institutes the meal that would sustain the church.", locationId: "jerusalem" },
  { id: "crucifixion", name: "Crucifixion & Resurrection", year: 30, epochId: "nt-era", importance: 3, passage: { book: "Luke", chapter: 23 }, description: "'It is finished.' The third day He rose again.", locationId: "jerusalem" },
  { id: "pentecost", name: "Pentecost — Spirit poured out", year: 30, epochId: "nt-era", importance: 3, passage: { book: "Acts", chapter: 2 }, description: "The birth of the church; the gospel begins its global advance.", locationId: "jerusalem" },
  { id: "ascension", name: "Ascension of Jesus", year: 30, epochId: "nt-era", importance: 2, passage: { book: "Acts", chapter: 1, verseStart: 9 }, description: "Lifted up before their eyes. 'He will come back in the same way you have seen him go.'" },
  { id: "stephen-martyred", name: "Stephen martyred", year: 34, epochId: "nt-era", importance: 1, passage: { book: "Acts", chapter: 7, verseStart: 54 }, description: "The first Christian martyr — 'Lord, do not hold this sin against them.' Saul watches approvingly.", locationId: "jerusalem" },
  { id: "paul-converted", name: "Paul converted on the Damascus road", year: 34, epochId: "nt-era", importance: 2, passage: { book: "Acts", chapter: 9 }, description: "'Saul, Saul, why are you persecuting me?'", locationId: "damascus" },
  { id: "cornelius", name: "Cornelius — Gentiles receive the Spirit", year: 40, epochId: "nt-era", importance: 1, passage: { book: "Acts", chapter: 10 }, description: "Peter's vision of the sheet. The gospel breaks past every ethnic boundary.", locationId: "caesarea" },
  { id: "paul-first-journey", name: "Paul's first missionary journey", year: 46, epochId: "nt-era", importance: 1, passage: { book: "Acts", chapter: 13 }, description: "Paul and Barnabas set out from Antioch. The gospel reaches Cyprus and Asia Minor.", locationId: "antioch-syria" },
  { id: "jerusalem-council", name: "Jerusalem Council", year: 49, epochId: "nt-era", importance: 1, passage: { book: "Acts", chapter: 15 }, description: "The gospel is for Gentiles as Gentiles, by grace through faith.", locationId: "jerusalem" },
  { id: "paul-in-corinth", name: "Paul in Corinth — writes 1 Thessalonians", year: 50, epochId: "nt-era", importance: 1, passage: { book: "Acts", chapter: 18 }, description: "Paul's 18-month stay. The earliest New Testament letter is composed here.", locationId: "corinth" },
  { id: "paul-in-ephesus", name: "Paul in Ephesus — 3 years", year: 54, epochId: "nt-era", importance: 1, passage: { book: "Acts", chapter: 19 }, description: "'All the residents of Asia heard the word of the Lord.' Paul writes 1 Corinthians here.", locationId: "ephesus" },
  { id: "paul-writes-romans", name: "Paul writes Romans", year: 57, epochId: "nt-era", importance: 1, passage: { book: "Romans", chapter: 1 }, description: "From Corinth, Paul writes the most systematic presentation of the gospel.", locationId: "corinth" },
  { id: "paul-arrested", name: "Paul arrested in Jerusalem", year: 57, epochId: "nt-era", importance: 1, passage: { book: "Acts", chapter: 21, verseStart: 30 }, description: "A riot in the temple courts. Paul is taken into Roman custody — the beginning of his journey to Rome.", locationId: "jerusalem" },
  { id: "paul-reaches-rome", name: "Paul reaches Rome", year: 61, epochId: "nt-era", importance: 1, passage: { book: "Acts", chapter: 28, verseStart: 16 }, description: "Under house arrest, Paul preaches the kingdom of God for two years in the capital of the world.", locationId: "rome" },
  { id: "temple-destroyed-70", name: "Temple destroyed", year: 70, epochId: "nt-era", importance: 2, passage: { book: "Luke", chapter: 21, verseStart: 6 }, description: "As Jesus foretold — not one stone left upon another.", locationId: "jerusalem" },
  { id: "revelation", name: "Revelation given on Patmos", year: 95, epochId: "nt-era", importance: 2, passage: { book: "Revelation", chapter: 1 }, description: "The unveiling of Jesus Christ.", locationId: "patmos" },
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
