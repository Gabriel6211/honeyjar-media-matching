import pg from "pg";
import pgvector from "pgvector/pg";
import { readFileSync } from "fs";
import { join } from "path";

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return pool;
}

export async function initDb(): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query("CREATE EXTENSION IF NOT EXISTS vector");
    await pgvector.registerTypes(client);

    const schemaPath = join(process.cwd(), "src/db/schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");
    await client.query(schema);

    console.log("Database initialized (tables + pgvector ready)");
  } finally {
    client.release();
  }
}
