import { pgTable, serial, text, integer, vector, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// Placeholder schema — expand as features are built.
// pgvector extension must be enabled: CREATE EXTENSION IF NOT EXISTS vector;

export const verses = pgTable(
  "verses",
  {
    id: serial("id").primaryKey(),
    book: text("book").notNull(),
    chapter: integer("chapter").notNull(),
    verse: integer("verse").notNull(),
    text: text("text").notNull(),
    embedding: vector("embedding", { dimensions: 768 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // Natural key: each (book, chapter, verse) is unique.
    // Enables ON CONFLICT DO NOTHING for resumable seeding.
    bookChapterVerseIdx: uniqueIndex("verses_book_chapter_verse_uniq").on(
      table.book,
      table.chapter,
      table.verse,
    ),
  }),
);

export type Verse = typeof verses.$inferSelect;
export type NewVerse = typeof verses.$inferInsert;
