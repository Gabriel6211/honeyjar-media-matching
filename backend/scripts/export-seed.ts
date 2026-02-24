import dotenv from "dotenv";
import { join } from "path";
import { writeFileSync } from "fs";

dotenv.config({ path: join(process.cwd(), "../.env") });

import { initDb, getPool } from "../src/db/client.js";

async function main() {
  await initDb();
  const pool = getPool();

  const articles = await pool.query(
    `SELECT id, title, author, outlet, outlet_type, section, url,
            published_at, summary, embedding::text
     FROM articles
     WHERE embedding IS NOT NULL
     ORDER BY published_at DESC`
  );

  const outputPath = join(process.cwd(), "data/seed-articles.json");
  writeFileSync(outputPath, JSON.stringify(articles.rows, null, 2));

  console.log(`Exported ${articles.rows.length} articles to ${outputPath}`);
  await pool.end();
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
