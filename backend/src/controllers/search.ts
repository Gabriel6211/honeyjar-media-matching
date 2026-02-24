import { Request, Response } from "express";
import { getPool } from "../db/client.js";
import { embedText } from "../services/embedding.js";
import { rankReporters } from "../services/ranking.js";
import { enrichReporter } from "../services/enrichment.js";
import { geographyToRegions } from "../services/geography-classifier.js";
import pgvector from "pgvector/pg";
import type { OutletType, Geography, RankedReporter } from "../types/index.js";

/**
 * Handles POST /api/search.
 *
 * Flow:
 *   1. Embed the brief into a vector using OpenAI
 *   2. Build a dynamic SQL query with optional filters (outlet_type, geography)
 *   3. Query pgvector for the most similar articles
 *   4. Rank and group by reporter using weighted scoring
 *   5. Enrich each reporter with (mocked) contact info
 *   6. Return top 10-15 reporters
 */
export async function handleSearch(req: Request, res: Response): Promise<void> {
  try {
    const { brief, outlet_types, geography, focus_publications, competitors } = req.body;
    const outletTypes: OutletType[] = outlet_types ?? [];
    const geoFilter: Geography[] = geography ?? [];

    // Enrich the brief with optional context before embedding.
    // This gives the vector search more signal to find relevant articles.
    let enrichedBrief = brief;
    if (focus_publications) {
      enrichedBrief += ` Focus publications: ${focus_publications}.`;
    }
    if (competitors) {
      enrichedBrief += ` Competitors and context: ${competitors}.`;
    }

    const briefVector = await embedText(enrichedBrief);

    // Build query dynamically — add WHERE clauses based on which filters are active
    const conditions: string[] = [
      "embedding IS NOT NULL",
      "author IS NOT NULL",
    ];
    const params: unknown[] = [pgvector.toSql(briefVector)];
    let paramIdx = 2;

    if (outletTypes.length > 0) {
      conditions.push(`outlet_type = ANY($${paramIdx}::text[])`);
      params.push(outletTypes);
      paramIdx++;
    }

    // Expand geography selections into matching regions
    // e.g. user picks ["us_eu_uk"] → we match ["us", "uk", "eu"]
    const allowedRegions = expandGeography(geoFilter);
    if (allowedRegions) {
      conditions.push(`geography = ANY($${paramIdx}::text[])`);
      params.push(allowedRegions);
      paramIdx++;
    }

    const query = `
      SELECT
        id, title, author, outlet, outlet_type, url, published_at, summary,
        1 - (embedding <=> $1::vector) AS similarity
      FROM articles
      WHERE ${conditions.join("\n        AND ")}
      ORDER BY embedding <=> $1::vector
      LIMIT 100
    `;

    const pool = getPool();
    const { rows } = await pool.query(query, params);

    if (rows.length === 0) {
      res.json({ reporters: [], total: 0 });
      return;
    }

    const ranked = rankReporters(rows, outletTypes);

    const results: RankedReporter[] = ranked.map((r) => {
      const contact = enrichReporter(r.name, r.outlet);

      return {
        reporter: {
          id: "",
          name: r.name,
          outlet: r.outlet,
          title: null,
          beat: null,
          email: contact.email,
          email_confidence: contact.email_confidence,
          linkedin_url: contact.linkedin_url,
          twitter_handle: contact.twitter_handle,
        },
        score: Math.round(r.score * 1000) / 1000,
        justification: buildJustification(r.name, r.articles, r.score),
        articles: r.articles.map((a) => ({
          title: a.title,
          url: a.url,
          published_at: a.published_at,
          similarity: Math.round(a.similarity * 1000) / 1000,
        })),
      };
    });

    res.json({ reporters: results, total: results.length });
  } catch (err) {
    console.error("Search error:", err);
    const message = err instanceof Error ? err.message : "Search failed";
    // Surface embedding/API errors for easier debugging (e.g. missing OPENAI_API_KEY)
    const userMessage =
      message.toLowerCase().includes("openai") || message.toLowerCase().includes("embedding")
        ? `Embedding failed: ${message}`
        : "Search failed";
    res.status(500).json({ error: userMessage });
  }
}

/**
 * Takes the user's geography selections (e.g. ["us", "us_eu_uk"])
 * and expands them into the set of outlet regions to match.
 * Returns null if no filtering should be applied ("global" or empty).
 */
function expandGeography(geoSelections: Geography[]): string[] | null {
  if (geoSelections.length === 0) return null;

  const regions = new Set<string>();

  for (const geo of geoSelections) {
    const mapped = geographyToRegions(geo);
    if (mapped === null) return null; // "global" means no filter
    mapped.forEach((r) => regions.add(r));
  }

  return [...regions];
}

/**
 * Builds a human-readable justification for why a reporter matches.
 * Guards against empty articles (edge case when all matches are filtered out).
 */
function buildJustification(
  name: string,
  articles: { title: string; similarity: number }[],
  score: number
): string {
  if (articles.length === 0) {
    return `${name} matches your brief. Overall relevance score: ${Math.round(score * 100)}%.`;
  }

  const topArticle = articles[0];
  const matchPct = Math.round(topArticle.similarity * 100);
  const articleCount = articles.length;

  return (
    `${name} has ${articleCount} recent article${articleCount > 1 ? "s" : ""} ` +
    `closely matching your brief (top match: ${matchPct}% similarity on ` +
    `"${topArticle.title}"). Overall relevance score: ${Math.round(score * 100)}%.`
  );
}
