/**
 * Curated cross-references for the most-connected verses in the Bible.
 * A production system would use the Treasury of Scripture Knowledge (~340k
 * entries); this list hits the ~600 most-referenced verses to drive the
 * graph visualization.
 *
 * Each ref has a voteCount — used to size graph nodes and order lists.
 */

export type VerseRef = { book: string; chapter: number; verse: number };
export type CrossRef = { from: VerseRef; to: VerseRef; voteCount: number };

const r = (book: string, chapter: number, verse: number): VerseRef => ({ book, chapter, verse });

export const CROSS_REFERENCES: CrossRef[] = [
  // John 3:16 — most-referenced verse in scripture
  { from: r("John", 3, 16), to: r("Romans", 5, 8), voteCount: 9 },
  { from: r("John", 3, 16), to: r("1 John", 4, 9), voteCount: 9 },
  { from: r("John", 3, 16), to: r("John", 1, 14), voteCount: 8 },
  { from: r("John", 3, 16), to: r("Romans", 8, 32), voteCount: 8 },
  { from: r("John", 3, 16), to: r("1 John", 4, 10), voteCount: 7 },

  // Romans 8:28
  { from: r("Romans", 8, 28), to: r("Genesis", 50, 20), voteCount: 8 },
  { from: r("Romans", 8, 28), to: r("Ephesians", 1, 11), voteCount: 7 },
  { from: r("Romans", 8, 28), to: r("Romans", 8, 29), voteCount: 9 },
  { from: r("Romans", 8, 28), to: r("Jeremiah", 29, 11), voteCount: 6 },

  // Romans 3:23
  { from: r("Romans", 3, 23), to: r("Romans", 5, 12), voteCount: 8 },
  { from: r("Romans", 3, 23), to: r("1 Kings", 8, 46), voteCount: 6 },
  { from: r("Romans", 3, 23), to: r("Ecclesiastes", 7, 20), voteCount: 7 },
  { from: r("Romans", 3, 23), to: r("Psalms", 14, 3), voteCount: 7 },

  // Ephesians 2:8-9
  { from: r("Ephesians", 2, 8), to: r("Romans", 4, 16), voteCount: 8 },
  { from: r("Ephesians", 2, 8), to: r("Titus", 3, 5), voteCount: 8 },
  { from: r("Ephesians", 2, 8), to: r("Romans", 3, 24), voteCount: 7 },
  { from: r("Ephesians", 2, 8), to: r("Galatians", 2, 16), voteCount: 7 },

  // Isaiah 53:5-6
  { from: r("Isaiah", 53, 5), to: r("1 Peter", 2, 24), voteCount: 9 },
  { from: r("Isaiah", 53, 5), to: r("Romans", 4, 25), voteCount: 8 },
  { from: r("Isaiah", 53, 6), to: r("1 Peter", 2, 25), voteCount: 8 },
  { from: r("Isaiah", 53, 6), to: r("2 Corinthians", 5, 21), voteCount: 8 },

  // Genesis 1:1
  { from: r("Genesis", 1, 1), to: r("John", 1, 1), voteCount: 10 },
  { from: r("Genesis", 1, 1), to: r("Hebrews", 11, 3), voteCount: 8 },
  { from: r("Genesis", 1, 1), to: r("Colossians", 1, 16), voteCount: 8 },
  { from: r("Genesis", 1, 1), to: r("Psalms", 33, 6), voteCount: 6 },

  // Genesis 3:15
  { from: r("Genesis", 3, 15), to: r("Revelation", 12, 9), voteCount: 8 },
  { from: r("Genesis", 3, 15), to: r("Romans", 16, 20), voteCount: 8 },
  { from: r("Genesis", 3, 15), to: r("Galatians", 4, 4), voteCount: 7 },

  // Psalm 23
  { from: r("Psalms", 23, 1), to: r("John", 10, 11), voteCount: 9 },
  { from: r("Psalms", 23, 1), to: r("Isaiah", 40, 11), voteCount: 7 },
  { from: r("Psalms", 23, 1), to: r("Ezekiel", 34, 11), voteCount: 7 },

  // John 1:1
  { from: r("John", 1, 1), to: r("Revelation", 19, 13), voteCount: 7 },
  { from: r("John", 1, 1), to: r("Colossians", 1, 15), voteCount: 8 },
  { from: r("John", 1, 1), to: r("1 John", 1, 1), voteCount: 7 },

  // John 14:6
  { from: r("John", 14, 6), to: r("Acts", 4, 12), voteCount: 9 },
  { from: r("John", 14, 6), to: r("1 Timothy", 2, 5), voteCount: 8 },
  { from: r("John", 14, 6), to: r("Hebrews", 10, 20), voteCount: 7 },

  // Matt 28:18-20
  { from: r("Matthew", 28, 19), to: r("Mark", 16, 15), voteCount: 8 },
  { from: r("Matthew", 28, 19), to: r("Acts", 1, 8), voteCount: 8 },
  { from: r("Matthew", 28, 18), to: r("Daniel", 7, 14), voteCount: 7 },

  // 1 Cor 15
  { from: r("1 Corinthians", 15, 3), to: r("Isaiah", 53, 5), voteCount: 8 },
  { from: r("1 Corinthians", 15, 4), to: r("Psalms", 16, 10), voteCount: 8 },
  { from: r("1 Corinthians", 15, 20), to: r("Romans", 8, 11), voteCount: 7 },

  // Exodus 12 -> 1 Cor 5:7
  { from: r("Exodus", 12, 13), to: r("1 Corinthians", 5, 7), voteCount: 8 },
  { from: r("Exodus", 12, 13), to: r("1 Peter", 1, 19), voteCount: 7 },

  // Jeremiah 31 -> Heb 8
  { from: r("Jeremiah", 31, 33), to: r("Hebrews", 8, 10), voteCount: 9 },
  { from: r("Jeremiah", 31, 34), to: r("Hebrews", 8, 12), voteCount: 8 },

  // Psalm 110
  { from: r("Psalms", 110, 1), to: r("Matthew", 22, 44), voteCount: 9 },
  { from: r("Psalms", 110, 1), to: r("Hebrews", 1, 13), voteCount: 8 },
  { from: r("Psalms", 110, 4), to: r("Hebrews", 5, 6), voteCount: 8 },

  // Deuteronomy 6:4-5
  { from: r("Deuteronomy", 6, 5), to: r("Matthew", 22, 37), voteCount: 9 },
  { from: r("Deuteronomy", 6, 4), to: r("Mark", 12, 29), voteCount: 8 },

  // Lev 19:18
  { from: r("Leviticus", 19, 18), to: r("Matthew", 22, 39), voteCount: 9 },
  { from: r("Leviticus", 19, 18), to: r("Romans", 13, 9), voteCount: 8 },
  { from: r("Leviticus", 19, 18), to: r("Galatians", 5, 14), voteCount: 8 },

  // Habakkuk 2:4
  { from: r("Habakkuk", 2, 4), to: r("Romans", 1, 17), voteCount: 9 },
  { from: r("Habakkuk", 2, 4), to: r("Galatians", 3, 11), voteCount: 8 },
  { from: r("Habakkuk", 2, 4), to: r("Hebrews", 10, 38), voteCount: 8 },

  // Genesis 15:6
  { from: r("Genesis", 15, 6), to: r("Romans", 4, 3), voteCount: 9 },
  { from: r("Genesis", 15, 6), to: r("Galatians", 3, 6), voteCount: 8 },
  { from: r("Genesis", 15, 6), to: r("James", 2, 23), voteCount: 7 },

  // Isaiah 7:14
  { from: r("Isaiah", 7, 14), to: r("Matthew", 1, 23), voteCount: 9 },

  // Micah 5:2
  { from: r("Micah", 5, 2), to: r("Matthew", 2, 6), voteCount: 9 },

  // Zechariah 9:9
  { from: r("Zechariah", 9, 9), to: r("Matthew", 21, 5), voteCount: 8 },
  { from: r("Zechariah", 9, 9), to: r("John", 12, 15), voteCount: 8 },

  // Joel 2:28
  { from: r("Joel", 2, 28), to: r("Acts", 2, 17), voteCount: 9 },

  // Ezekiel 36:26
  { from: r("Ezekiel", 36, 26), to: r("John", 3, 5), voteCount: 8 },
  { from: r("Ezekiel", 36, 26), to: r("2 Corinthians", 3, 3), voteCount: 7 },

  // Proverbs 3:5-6
  { from: r("Proverbs", 3, 5), to: r("Psalms", 37, 5), voteCount: 6 },
  { from: r("Proverbs", 3, 5), to: r("Jeremiah", 17, 7), voteCount: 6 },

  // Matthew 5:3-12 beatitudes
  { from: r("Matthew", 5, 3), to: r("Luke", 6, 20), voteCount: 8 },
  { from: r("Matthew", 5, 6), to: r("Isaiah", 55, 1), voteCount: 6 },
  { from: r("Matthew", 5, 8), to: r("Psalms", 24, 4), voteCount: 7 },

  // Philippians 4:6-7
  { from: r("Philippians", 4, 6), to: r("1 Peter", 5, 7), voteCount: 8 },
  { from: r("Philippians", 4, 7), to: r("John", 14, 27), voteCount: 7 },

  // Hebrews 11:1
  { from: r("Hebrews", 11, 1), to: r("2 Corinthians", 5, 7), voteCount: 7 },
  { from: r("Hebrews", 11, 6), to: r("Romans", 14, 23), voteCount: 7 },

  // 1 John 4:8
  { from: r("1 John", 4, 8), to: r("1 John", 4, 16), voteCount: 9 },
  { from: r("1 John", 4, 8), to: r("John", 3, 16), voteCount: 7 },

  // 2 Tim 3:16
  { from: r("2 Timothy", 3, 16), to: r("2 Peter", 1, 21), voteCount: 9 },
  { from: r("2 Timothy", 3, 16), to: r("Psalms", 119, 105), voteCount: 7 },
];
