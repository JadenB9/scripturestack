import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

// Connect on first use rather than at import. `next build` imports every
// route module, and without this a machine with no DATABASE_URL (CI, a
// fresh clone) couldn't build at all. The first real query still fails
// with the same clear message.
let real: Db | null = null;

function connect(): Db {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    if (!real) real = connect();
    const value = real[prop as keyof Db];
    // Methods need the real instance as `this`.
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(real) : value;
  },
});
