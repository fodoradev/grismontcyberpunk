// Applies SQL migrations from db/migrations. Run with: npm run db:migrate
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
await migrate(drizzle({ client: pool }), { migrationsFolder: "db/migrations" });
await pool.end();
console.log("Migrations applied");
