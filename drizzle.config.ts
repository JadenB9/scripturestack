import type { Config } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

// Use the unpooled URL for schema operations — Neon's pooled URL goes through
// pgbouncer which doesn't support migration statements. Runtime queries still
// use the pooled DATABASE_URL (see src/db/client.ts).
const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL must be set");
}

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
} satisfies Config;
