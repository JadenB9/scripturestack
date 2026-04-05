/**
 * Verse-level chapter events — used by the Chapter Timeline strip.
 * Events are within a single chapter and mark narrative/discourse/poetic/etc transitions.
 *
 * harmonyGroupId — if set, the event occurs in multiple Gospels and can be shown
 * in the "Harmony" view of the chapter timeline.
 */

export type ChapterEventType =
  | "narrative"
  | "discourse"
  | "prophecy"
  | "prayer"
  | "miracle"
  | "legal"
  | "poetic";

export type ChapterEvent = {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  title: string;
  type: ChapterEventType;
  harmonyGroupId?: string;
};

export const CHAPTER_EVENTS: ChapterEvent[] = [
  // Genesis 1 — creation days
  { book: "Genesis", chapter: 1, verseStart: 1, verseEnd: 2, title: "Formless & void", type: "narrative" },
  { book: "Genesis", chapter: 1, verseStart: 3, verseEnd: 5, title: "Day 1: light", type: "narrative" },
  { book: "Genesis", chapter: 1, verseStart: 6, verseEnd: 8, title: "Day 2: sky", type: "narrative" },
  { book: "Genesis", chapter: 1, verseStart: 9, verseEnd: 13, title: "Day 3: land", type: "narrative" },
  { book: "Genesis", chapter: 1, verseStart: 14, verseEnd: 19, title: "Day 4: lights", type: "narrative" },
  { book: "Genesis", chapter: 1, verseStart: 20, verseEnd: 23, title: "Day 5: fish & birds", type: "narrative" },
  { book: "Genesis", chapter: 1, verseStart: 24, verseEnd: 31, title: "Day 6: land animals & humanity", type: "narrative" },

  // Matthew 5 — Sermon on the Mount chapter 1
  { book: "Matthew", chapter: 5, verseStart: 1, verseEnd: 2, title: "Setting", type: "narrative", harmonyGroupId: "sermon-mount" },
  { book: "Matthew", chapter: 5, verseStart: 3, verseEnd: 12, title: "Beatitudes", type: "discourse", harmonyGroupId: "beatitudes" },
  { book: "Matthew", chapter: 5, verseStart: 13, verseEnd: 16, title: "Salt & light", type: "discourse" },
  { book: "Matthew", chapter: 5, verseStart: 17, verseEnd: 20, title: "Law fulfilled", type: "discourse" },
  { book: "Matthew", chapter: 5, verseStart: 21, verseEnd: 26, title: "Anger", type: "discourse" },
  { book: "Matthew", chapter: 5, verseStart: 27, verseEnd: 30, title: "Lust", type: "discourse" },
  { book: "Matthew", chapter: 5, verseStart: 31, verseEnd: 32, title: "Divorce", type: "discourse" },
  { book: "Matthew", chapter: 5, verseStart: 33, verseEnd: 37, title: "Oaths", type: "discourse" },
  { book: "Matthew", chapter: 5, verseStart: 38, verseEnd: 42, title: "Retaliation", type: "discourse" },
  { book: "Matthew", chapter: 5, verseStart: 43, verseEnd: 48, title: "Love enemies", type: "discourse" },

  // Luke 6 — sermon on the plain (harmony)
  { book: "Luke", chapter: 6, verseStart: 17, verseEnd: 19, title: "Crowd gathers", type: "narrative", harmonyGroupId: "sermon-mount" },
  { book: "Luke", chapter: 6, verseStart: 20, verseEnd: 26, title: "Blessings & woes", type: "discourse", harmonyGroupId: "beatitudes" },
  { book: "Luke", chapter: 6, verseStart: 27, verseEnd: 36, title: "Love your enemies", type: "discourse" },

  // John 1
  { book: "John", chapter: 1, verseStart: 1, verseEnd: 5, title: "The Word", type: "discourse" },
  { book: "John", chapter: 1, verseStart: 6, verseEnd: 8, title: "John the Baptist — witness", type: "narrative" },
  { book: "John", chapter: 1, verseStart: 9, verseEnd: 13, title: "True light", type: "discourse" },
  { book: "John", chapter: 1, verseStart: 14, verseEnd: 18, title: "Word became flesh", type: "discourse" },
  { book: "John", chapter: 1, verseStart: 19, verseEnd: 28, title: "John's testimony", type: "narrative" },
  { book: "John", chapter: 1, verseStart: 29, verseEnd: 34, title: "Behold, the Lamb", type: "narrative" },
  { book: "John", chapter: 1, verseStart: 35, verseEnd: 42, title: "First disciples", type: "narrative" },
  { book: "John", chapter: 1, verseStart: 43, verseEnd: 51, title: "Philip & Nathanael", type: "narrative" },

  // Romans 8
  { book: "Romans", chapter: 8, verseStart: 1, verseEnd: 4, title: "No condemnation", type: "discourse" },
  { book: "Romans", chapter: 8, verseStart: 5, verseEnd: 11, title: "Flesh vs Spirit", type: "discourse" },
  { book: "Romans", chapter: 8, verseStart: 12, verseEnd: 17, title: "Adopted as sons", type: "discourse" },
  { book: "Romans", chapter: 8, verseStart: 18, verseEnd: 25, title: "Creation groans", type: "discourse" },
  { book: "Romans", chapter: 8, verseStart: 26, verseEnd: 27, title: "Spirit intercedes", type: "prayer" },
  { book: "Romans", chapter: 8, verseStart: 28, verseEnd: 30, title: "All things work together", type: "discourse" },
  { book: "Romans", chapter: 8, verseStart: 31, verseEnd: 39, title: "More than conquerors", type: "discourse" },

  // Psalm 23
  { book: "Psalms", chapter: 23, verseStart: 1, verseEnd: 3, title: "The Shepherd leads", type: "poetic" },
  { book: "Psalms", chapter: 23, verseStart: 4, verseEnd: 4, title: "Through the valley", type: "poetic" },
  { book: "Psalms", chapter: 23, verseStart: 5, verseEnd: 5, title: "Table prepared", type: "poetic" },
  { book: "Psalms", chapter: 23, verseStart: 6, verseEnd: 6, title: "Dwelling forever", type: "poetic" },

  // Exodus 12 — Passover
  { book: "Exodus", chapter: 12, verseStart: 1, verseEnd: 13, title: "Passover instituted", type: "legal" },
  { book: "Exodus", chapter: 12, verseStart: 14, verseEnd: 20, title: "Feast of Unleavened Bread", type: "legal" },
  { book: "Exodus", chapter: 12, verseStart: 21, verseEnd: 28, title: "Passover kept", type: "narrative" },
  { book: "Exodus", chapter: 12, verseStart: 29, verseEnd: 32, title: "Plague of firstborn", type: "narrative" },
  { book: "Exodus", chapter: 12, verseStart: 33, verseEnd: 42, title: "The Exodus", type: "narrative" },

  // John 3 — Nicodemus
  { book: "John", chapter: 3, verseStart: 1, verseEnd: 8, title: "Nicodemus by night", type: "narrative" },
  { book: "John", chapter: 3, verseStart: 9, verseEnd: 15, title: "Born of Spirit", type: "discourse" },
  { book: "John", chapter: 3, verseStart: 16, verseEnd: 21, title: "God so loved the world", type: "discourse" },
  { book: "John", chapter: 3, verseStart: 22, verseEnd: 36, title: "John's final witness", type: "narrative" },

  // Mark 1 — beginning of ministry
  { book: "Mark", chapter: 1, verseStart: 1, verseEnd: 8, title: "John prepares the way", type: "narrative" },
  { book: "Mark", chapter: 1, verseStart: 9, verseEnd: 11, title: "Jesus baptized", type: "narrative", harmonyGroupId: "baptism" },
  { book: "Mark", chapter: 1, verseStart: 12, verseEnd: 13, title: "Tempted in the wilderness", type: "narrative", harmonyGroupId: "temptation" },
  { book: "Mark", chapter: 1, verseStart: 14, verseEnd: 20, title: "First disciples called", type: "narrative" },
  { book: "Mark", chapter: 1, verseStart: 21, verseEnd: 28, title: "Unclean spirit cast out", type: "miracle" },
  { book: "Mark", chapter: 1, verseStart: 29, verseEnd: 34, title: "Healings at Capernaum", type: "miracle" },
  { book: "Mark", chapter: 1, verseStart: 35, verseEnd: 39, title: "Withdraws to pray", type: "prayer" },
  { book: "Mark", chapter: 1, verseStart: 40, verseEnd: 45, title: "Leper healed", type: "miracle" },

  // Matthew 3
  { book: "Matthew", chapter: 3, verseStart: 1, verseEnd: 12, title: "John the Baptist", type: "narrative" },
  { book: "Matthew", chapter: 3, verseStart: 13, verseEnd: 17, title: "Jesus baptized", type: "narrative", harmonyGroupId: "baptism" },

  // Luke 3
  { book: "Luke", chapter: 3, verseStart: 1, verseEnd: 20, title: "John's ministry", type: "narrative" },
  { book: "Luke", chapter: 3, verseStart: 21, verseEnd: 22, title: "Jesus baptized", type: "narrative", harmonyGroupId: "baptism" },
  { book: "Luke", chapter: 3, verseStart: 23, verseEnd: 38, title: "Genealogy of Jesus", type: "narrative" },

  // John 1 baptism (mention)
  { book: "John", chapter: 1, verseStart: 29, verseEnd: 34, title: "Lamb of God baptism testimony", type: "narrative", harmonyGroupId: "baptism" },
];

export function getEventsForChapter(book: string, chapter: number): ChapterEvent[] {
  return CHAPTER_EVENTS.filter((e) => e.book === book && e.chapter === chapter);
}
