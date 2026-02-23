import dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(process.cwd(), "../.env") });

import { fetchNewsApiArticles } from "../src/services/newsapi.js";
import { classifyOutlet } from "../src/services/outlet-classifier.js";
import { initDb, getPool } from "../src/db/client.js";

// Search queries covering the 3 story briefs from the assignment:
// A) Battery startup / climate / EV / US supply chain
// B) Restaurant robotics / automation / fundraising
// C) Mortgage fintech / AWS / cloud infrastructure
const QUERIES = [
  "battery silicon climate EV supply chain",
  "battery startup domestic manufacturing energy",
  "electric vehicle materials breakthrough",
  "restaurant robotics automation",
  "food service robots labor shortage",
  "quick service restaurant technology seed funding",
  "mortgage fintech cloud infrastructure",
  "fintech AWS partnership compliance",
  "fintech platform infrastructure cost",
];

async function insertArticles(
  articles: Awaited<ReturnType<typeof fetchNewsApiArticles>>
): Promise<number> {
  const pool = getPool();
  let inserted = 0;

  for (const article of articles) {
    const outletType = classifyOutlet(article.outlet);
    try {
      await pool.query(
        `INSERT INTO articles (title, author, outlet, outlet_type, section, url, published_at, summary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (url) DO NOTHING`,
        [
          article.title,
          article.author,
          article.outlet,
          outletType,
          article.section,
          article.url,
          article.published_at,
          article.summary,
        ]
      );
      inserted++;
    } catch (err) {
      console.warn(`Skipped article: ${article.url}`, err);
    }
  }

  return inserted;
}

async function main() {
  console.log("Initializing database...");
  await initDb();

  let totalArticles = 0;

  for (const query of QUERIES) {
    console.log(`\nFetching articles for: "${query}"`);

    try {
      const articles = await fetchNewsApiArticles(query, 50);
      console.log(`Got ${articles.length} articles from NewsAPI`);

      // Show a sample of outlets to verify diversity
      const outlets = [...new Set(articles.map((a) => a.outlet))];
      console.log(`Outlets: ${outlets.slice(0, 5).join(", ")}${outlets.length > 5 ? "..." : ""}`);

      const inserted = await insertArticles(articles);
      console.log(`Inserted ${inserted} new articles`);
      totalArticles += inserted;
    } catch (err) {
      console.error(`Error fetching articles for "${query}":`, err);
    }

    // Small delay between requests to be respectful
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Print summary
  const pool = getPool();
  const countResult = await pool.query("SELECT COUNT(*) FROM articles");
  const outletResult = await pool.query(
    "SELECT outlet_type, COUNT(*) as count FROM articles GROUP BY outlet_type ORDER BY count DESC"
  );

  console.log(`Done! Total articles in database: ${countResult.rows[0].count}`);
  console.log(`New articles inserted this run: ${totalArticles}`);
  console.log("Articles by outlet type:");
  for (const row of outletResult.rows) {
    console.log(`  ${row.outlet_type}: ${row.count}`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
