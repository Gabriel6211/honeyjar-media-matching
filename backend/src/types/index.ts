export interface Article {
  id: string;
  title: string;
  author: string | null;
  outlet: string;
  section: string | null;
  url: string;
  published_at: Date | null;
  summary: string | null;
  embedding: number[] | null;
  created_at: Date;
}

export interface Reporter {
  id: string;
  name: string;
  outlet: string;
  title: string | null;
  beat: string | null;
  email: string | null;
  email_confidence: number | null;
  linkedin_url: string | null;
  twitter_handle: string | null;
}

export type OutletType =
  | "national_business_tech"
  | "trade_specialist"
  | "regional"
  | "newsletter"
  | "podcast";

export type Geography = "us" | "us_eu_uk" | "global";

export interface SearchFilters {
  outlet_types: OutletType[];
  geography: Geography[];
  focus_publications?: string;
  competitors?: string;
}

export interface StoryBrief {
  text: string;
  filters: SearchFilters;
}

export interface ReporterArticle {
  title: string;
  url: string;
  published_at: Date | null;
  similarity: number;
}

export interface RankedReporter {
  reporter: Reporter;
  score: number;
  justification: string;
  articles: ReporterArticle[];
}
