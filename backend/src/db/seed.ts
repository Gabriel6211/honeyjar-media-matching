import { readFileSync } from "fs";
import { join } from "path";
import { getPool } from "./client.js";

/**
 * Loads seed articles from the committed JSON file into the database.
 * Used when running without API keys (e.g. reviewer runs `make seed`).
 */
export async function loadSeedData(): Promise<void> {
  const seedPath = join(process.cwd(), "data/seed-articles.json");

  let raw: string;
  try {
    raw = readFileSync(seedPath, "utf-8");
  } catch {
    console.log("No seed file found at", seedPath);
    return;
  }

  const articles = JSON.parse(raw);
  const pool = getPool();

  let inserted = 0;
  for (const article of articles) {
    try {
      await pool.query(
        `INSERT INTO articles (id, title, author, outlet, outlet_type, geography, section, url, published_at, summary, embedding)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (url) DO NOTHING`,
        [
          article.id,
          article.title,
          article.author,
          article.outlet,
          article.outlet_type,
          article.geography,
          article.section,
          article.url,
          article.published_at,
          article.summary,
          article.embedding,
        ]
      );
      inserted++;
    } catch (err) {
      console.warn(`Skipped seed article: ${article.url}`, err);
    }
  }

  console.log(`Loaded ${inserted} articles from seed data`);
}
