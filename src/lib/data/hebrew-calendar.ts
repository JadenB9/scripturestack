/**
 * The Hebrew calendar — 12 months plus the appointed feasts and fasts.
 * Colors follow the design system's pilgrimage/fast/newmoon palette.
 */

export type HebrewMonth = {
  index: number;
  name: string;
  hebrewName: string;
  gregorian: string;
  feasts: Feast[];
};

export type FeastType = "pilgrimage" | "feast" | "fast" | "new-moon" | "sabbath";

export type Feast = {
  id: string;
  name: string;
  hebrewName: string;
  type: FeastType;
  dayRange: string;
  leviticalReference: string;
  significance: string;
  fulfillment?: string;
  passages: Array<{ book: string; chapter: number; verseStart?: number; verseEnd?: number }>;
};

export const HEBREW_MONTHS: HebrewMonth[] = [
  {
    index: 1,
    name: "Nisan (Abib)",
    hebrewName: "נִיסָן",
    gregorian: "Mar–Apr",
    feasts: [
      {
        id: "passover",
        name: "Passover",
        hebrewName: "פֶּסַח (Pesach)",
        type: "pilgrimage",
        dayRange: "14 Nisan",
        leviticalReference: "Leviticus 23:5",
        significance: "Remembers the LORD passing over Israel's houses in Egypt when the firstborn of Egypt were struck down. The lamb's blood on the doorposts is a picture of Christ our Passover.",
        fulfillment: "Christ our Passover has been sacrificed — 1 Corinthians 5:7",
        passages: [{ book: "Exodus", chapter: 12 }, { book: "Leviticus", chapter: 23, verseStart: 5 }, { book: "Luke", chapter: 22, verseStart: 7 }],
      },
      {
        id: "unleavened",
        name: "Unleavened Bread",
        hebrewName: "חַג הַמַּצּוֹת",
        type: "pilgrimage",
        dayRange: "15–21 Nisan",
        leviticalReference: "Leviticus 23:6–8",
        significance: "A seven-day feast in which no leaven is eaten — remembering the haste of the Exodus and picturing a life purged of the leaven of sin.",
        fulfillment: "Let us celebrate the festival with the unleavened bread of sincerity and truth — 1 Cor 5:8",
        passages: [{ book: "Leviticus", chapter: 23, verseStart: 6, verseEnd: 8 }],
      },
      {
        id: "firstfruits",
        name: "Firstfruits",
        hebrewName: "בִּכּוּרִים (Bikkurim)",
        type: "feast",
        dayRange: "Day after the Sabbath of Passover week",
        leviticalReference: "Leviticus 23:9–14",
        significance: "The first sheaf of the barley harvest waved before the LORD — a pledge of the whole harvest to come.",
        fulfillment: "Christ has been raised from the dead, the firstfruits of those who have fallen asleep — 1 Cor 15:20",
        passages: [{ book: "Leviticus", chapter: 23, verseStart: 9, verseEnd: 14 }],
      },
    ],
  },
  {
    index: 2,
    name: "Iyar (Ziv)",
    hebrewName: "אִיָּיר",
    gregorian: "Apr–May",
    feasts: [
      {
        id: "second-passover",
        name: "Second Passover",
        hebrewName: "Pesach Sheni",
        type: "feast",
        dayRange: "14 Iyar",
        leviticalReference: "Numbers 9:10–11",
        significance: "A makeup Passover for those who were ritually unclean or away on a journey during the first. A picture of God's mercy for those who cannot keep pace.",
        passages: [{ book: "Numbers", chapter: 9, verseStart: 10, verseEnd: 11 }],
      },
    ],
  },
  {
    index: 3,
    name: "Sivan",
    hebrewName: "סִיוָן",
    gregorian: "May–Jun",
    feasts: [
      {
        id: "shavuot",
        name: "Weeks (Pentecost)",
        hebrewName: "שָׁבוּעוֹת (Shavuot)",
        type: "pilgrimage",
        dayRange: "6 Sivan (50 days after Firstfruits)",
        leviticalReference: "Leviticus 23:15–22",
        significance: "Fifty days after Firstfruits — the wheat harvest, and by tradition the anniversary of the giving of the Law at Sinai.",
        fulfillment: "The Spirit was poured out on Pentecost and 3,000 were added to the church — Acts 2",
        passages: [{ book: "Leviticus", chapter: 23, verseStart: 15, verseEnd: 22 }, { book: "Acts", chapter: 2 }],
      },
    ],
  },
  { index: 4, name: "Tammuz", hebrewName: "תַּמּוּז", gregorian: "Jun–Jul", feasts: [
    { id: "fast-17-tammuz", name: "Fast of the 17th of Tammuz", hebrewName: "Shiv'ah Asar b'Tammuz", type: "fast", dayRange: "17 Tammuz", leviticalReference: "Zechariah 8:19", significance: "Mourning the breach of Jerusalem's walls by Babylon in 586 BC and later by Rome in AD 70.", passages: [{ book: "Zechariah", chapter: 8, verseStart: 19 }] },
  ] },
  { index: 5, name: "Av", hebrewName: "אָב", gregorian: "Jul–Aug", feasts: [
    { id: "tisha-bav", name: "Tisha B'Av", hebrewName: "תִּשְׁעָה בְּאָב", type: "fast", dayRange: "9 Av", leviticalReference: "Zechariah 8:19", significance: "The great fast — mourning the destruction of both the first and second temples, which tradition says occurred on this day.", passages: [{ book: "Jeremiah", chapter: 52, verseStart: 12 }, { book: "Zechariah", chapter: 7, verseStart: 3 }] },
  ] },
  { index: 6, name: "Elul", hebrewName: "אֱלוּל", gregorian: "Aug–Sep", feasts: [] },
  {
    index: 7,
    name: "Tishri",
    hebrewName: "תִּשְׁרֵי",
    gregorian: "Sep–Oct",
    feasts: [
      {
        id: "trumpets",
        name: "Trumpets (Rosh Hashanah)",
        hebrewName: "יוֹם תְּרוּעָה",
        type: "feast",
        dayRange: "1 Tishri",
        leviticalReference: "Leviticus 23:23–25",
        significance: "A day of blowing trumpets — the Jewish civil new year and a solemn call to repentance.",
        passages: [{ book: "Leviticus", chapter: 23, verseStart: 23, verseEnd: 25 }, { book: "Numbers", chapter: 29, verseStart: 1, verseEnd: 6 }],
      },
      {
        id: "day-of-atonement",
        name: "Day of Atonement",
        hebrewName: "יוֹם כִּפּוּר (Yom Kippur)",
        type: "fast",
        dayRange: "10 Tishri",
        leviticalReference: "Leviticus 16; 23:26–32",
        significance: "The holiest day of the year. The high priest entered the Most Holy Place with the blood of atonement for the sins of the people.",
        fulfillment: "Christ entered the holy places once for all by means of his own blood — Hebrews 9:12",
        passages: [{ book: "Leviticus", chapter: 16 }, { book: "Hebrews", chapter: 9, verseStart: 11, verseEnd: 14 }],
      },
      {
        id: "tabernacles",
        name: "Tabernacles (Booths)",
        hebrewName: "סֻכּוֹת (Sukkot)",
        type: "pilgrimage",
        dayRange: "15–21 Tishri",
        leviticalReference: "Leviticus 23:33–43",
        significance: "Israel dwells in temporary booths for seven days, remembering the wilderness wandering and looking forward to God's dwelling with His people.",
        fulfillment: "The Word became flesh and tabernacled among us — John 1:14",
        passages: [{ book: "Leviticus", chapter: 23, verseStart: 33, verseEnd: 43 }, { book: "John", chapter: 7 }],
      },
    ],
  },
  { index: 8, name: "Cheshvan", hebrewName: "חֶשְׁוָן", gregorian: "Oct–Nov", feasts: [] },
  {
    index: 9,
    name: "Kislev",
    hebrewName: "כִּסְלֵו",
    gregorian: "Nov–Dec",
    feasts: [
      {
        id: "hanukkah",
        name: "Dedication (Hanukkah)",
        hebrewName: "חֲנֻכָּה",
        type: "feast",
        dayRange: "25 Kislev – 2 Tevet",
        leviticalReference: "Not in Torah — 1 Maccabees 4",
        significance: "Commemorates the cleansing of the Second Temple by the Maccabees in 164 BC after its desecration by Antiochus IV Epiphanes.",
        fulfillment: "Jesus walked in the temple during the Feast of Dedication — John 10:22",
        passages: [{ book: "John", chapter: 10, verseStart: 22 }],
      },
    ],
  },
  { index: 10, name: "Tevet", hebrewName: "טֵבֵת", gregorian: "Dec–Jan", feasts: [
    { id: "fast-tevet", name: "Fast of the 10th of Tevet", hebrewName: "Asarah b'Tevet", type: "fast", dayRange: "10 Tevet", leviticalReference: "Zechariah 8:19", significance: "Mourning the beginning of Nebuchadnezzar's siege of Jerusalem in 588 BC.", passages: [{ book: "2 Kings", chapter: 25, verseStart: 1 }] },
  ] },
  { index: 11, name: "Shevat", hebrewName: "שְׁבָט", gregorian: "Jan–Feb", feasts: [] },
  {
    index: 12,
    name: "Adar",
    hebrewName: "אֲדָר",
    gregorian: "Feb–Mar",
    feasts: [
      {
        id: "purim",
        name: "Purim",
        hebrewName: "פּוּרִים",
        type: "feast",
        dayRange: "14–15 Adar",
        leviticalReference: "Esther 9:20–32",
        significance: "Celebrates the deliverance of the Jews from Haman's plot through the courage of Esther and the providence of God.",
        passages: [{ book: "Esther", chapter: 9, verseStart: 20, verseEnd: 32 }],
      },
    ],
  },
];
