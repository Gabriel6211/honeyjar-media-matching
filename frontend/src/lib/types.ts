export type OutletType =
  | "national_business_tech"
  | "trade_specialist"
  | "regional"
  | "newsletter"
  | "podcast";

export type Geography = "us" | "us_eu_uk" | "global";

export interface ReporterArticle {
  title: string;
  url: string;
  published_at: string | null;
  similarity: number;
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

export interface RankedReporter {
  reporter: Reporter;
  score: number;
  justification: string;
  articles: ReporterArticle[];
}

export interface SearchResponse {
  reporters: RankedReporter[];
  total: number;
}

export interface SearchRequest {
  brief: string;
  refinements?: string[];
  outlet_types?: OutletType[];
  geography?: Geography[];
  focus_publications?: string;
  competitors?: string;
}

// Chat message types for the conversation flow
export type MessageRole = "system" | "user";

export type MessageType =
  | "text"
  | "outlet_picker"
  | "geography_picker"
  | "optional_input"
  | "loading"
  | "results"
  | "error";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  data?: SearchResponse;
}
