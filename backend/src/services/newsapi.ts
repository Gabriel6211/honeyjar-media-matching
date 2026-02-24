import type { Article } from "../types/index.js";

const NEWSAPI_BASE_URL = "https://newsapi.org/v2";

interface NewsApiSource {
  id: string | null;
  name: string;
}

interface NewsApiArticle {
  source: NewsApiSource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  publishedAt: string;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
}

/**
 * Fetches articles from NewsAPI for a given search query.
 * Returns them mapped to our Article shape (without embeddings).
 */
export async function fetchNewsApiArticles(
  query: string,
  pageSize = 50
): Promise<Omit<Article, "id" | "outlet_type" | "geography" | "embedding" | "created_at">[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    throw new Error("NEWSAPI_KEY is not set in environment");
  }

  const params = new URLSearchParams({
    q: query,
    apiKey,
    pageSize: String(pageSize),
    sortBy: "relevancy",
    language: "en",
  });

  const url = `${NEWSAPI_BASE_URL}/everything?${params}`;
  const res = await fetch(url);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`NewsAPI error: ${res.status} ${res.statusText} — ${body}`);
  }

  const data: NewsApiResponse = await res.json();

  return data.articles
    .filter((a) => a.title && a.title !== "[Removed]")
    .map((a) => ({
      title: a.title,
      author: a.author,
      outlet: a.source.name,
      section: null,
      url: a.url,
      published_at: new Date(a.publishedAt),
      summary: a.description,
    }));
}
