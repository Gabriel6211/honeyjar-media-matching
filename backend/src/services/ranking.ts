import type { OutletType } from "../types/index.js";

interface ArticleMatch {
  id: string;
  title: string;
  author: string | null;
  outlet: string;
  outlet_type: string | null;
  url: string;
  published_at: Date | null;
  summary: string | null;
  similarity: number;
}

interface ScoredReporter {
  name: string;
  outlet: string;
  outlet_type: string | null;
  score: number;
  articles: ArticleMatch[];
}

const WEIGHTS = {
  similarity: 0.5,
  recency: 0.3,
  outlet_relevance: 0.2,
};

/**
 * Calculates a recency score based on how recently the article was published.
 * More recent articles get higher scores because reporters who wrote about
 * a topic recently are more likely to cover it again.
 */
function recencyScore(publishedAt: Date | null): number {
  if (!publishedAt) return 0.2;

  const now = new Date();
  const daysAgo = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24);

  if (daysAgo <= 90) return 1.0;
  if (daysAgo <= 180) return 0.5;
  return 0.2;
}

/**
 * Returns 1.0 if the article's outlet type matches one of the user's
 * selected types, 0.3 otherwise. This lets users filter for e.g.
 * "only trade/specialist" outlets.
 */
function outletRelevanceScore(
  articleOutletType: string | null,
  selectedTypes: OutletType[]
): number {
  if (selectedTypes.length === 0) return 1.0;
  if (!articleOutletType) return 0.3;
  return selectedTypes.includes(articleOutletType as OutletType) ? 1.0 : 0.3;
}

/**
 * Takes raw article matches from pgvector and groups/ranks them by reporter.
 *
 * For each reporter (unique author + outlet), it:
 * 1. Averages the similarity scores of their matching articles
 * 2. Calculates recency (how recent their articles are)
 * 3. Checks outlet relevance (does their outlet match user preferences)
 * 4. Combines into a final score using weighted formula
 * 5. Picks the 2-3 best articles as justification
 */
export function rankReporters(
  matches: ArticleMatch[],
  selectedOutletTypes: OutletType[],
  topN = 15
): ScoredReporter[] {
  // Group articles by reporter (author + outlet)
  const reporterMap = new Map<string, ArticleMatch[]>();

  for (const match of matches) {
    if (!match.author) continue;
    const key = `${match.author}|||${match.outlet}`;
    if (!reporterMap.has(key)) {
      reporterMap.set(key, []);
    }
    reporterMap.get(key)!.push(match);
  }

  // Score each reporter
  const scored: ScoredReporter[] = [];

  for (const [key, articles] of reporterMap) {
    const [name, outlet] = key.split("|||");

    // Average the similarity scores of the articles of the reporter
    const avgSimilarity =
      articles.reduce((sum, a) => sum + a.similarity, 0) / articles.length;

    // Get the best recency score from the articles of the reporter
    const bestRecency = Math.max(...articles.map((a) => recencyScore(a.published_at)));

    // All articles have the same outlet type because they are grouped by author + outlet,
    // so we can use the first one
    const outletRel = outletRelevanceScore(
      articles[0].outlet_type,
      selectedOutletTypes
    );

    const score =
      WEIGHTS.similarity * avgSimilarity +
      WEIGHTS.recency * bestRecency +
      WEIGHTS.outlet_relevance * outletRel;

    // Keep top 3 articles sorted by similarity (for justification)
    const topArticles = articles
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    scored.push({
      name,
      outlet,
      outlet_type: articles[0].outlet_type,
      score,
      articles: topArticles,
    });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, topN);
}
