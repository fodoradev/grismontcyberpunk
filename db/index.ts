import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// One pool per process, reused across hot reloads and warm serverless invocations.
const cache = globalThis as unknown as { scorecardDb?: NodePgDatabase<typeof schema> };

/** Lazily connects so builds and pages that don't touch the database never need DATABASE_URL. */
export function getDb() {
  if (!cache.scorecardDb) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
    cache.scorecardDb = drizzle({ client: new Pool({ connectionString: process.env.DATABASE_URL, max: 5 }), schema });
  }
  return cache.scorecardDb;
}

export { schema };
