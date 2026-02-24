"use client";

import type { RankedReporter } from "@/lib/types";

interface ReporterCardProps {
  reporter: RankedReporter;
  rank: number;
}

/**
 * Formats a date string like "2026-02-10T14:30:00Z" into "Feb 10, 2026".
 * Returns "Unknown date" if the input is null or invalid.
 */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Unknown date";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Unknown date";
  }
}

/**
 * Converts a similarity score (0-1) into a percentage label with a color.
 * e.g. 0.87 → { label: "87%", color: "text-green-600" }
 */
function matchColor(score: number): string {
  if (score >= 0.8) return "text-green-600";
  if (score >= 0.6) return "text-orange-500";
  return "text-zinc-400";
}

export default function ReporterCard({ reporter, rank }: ReporterCardProps) {
  const { reporter: info, score, justification, articles } = reporter;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 overflow-hidden">
      {/* Header: rank badge, name, outlet, score */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-600">
            {rank}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-zinc-800">{info.name}</h3>
            <p className="text-xs text-zinc-400">{info.outlet}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-600">
          {Math.round(score * 100)}% match
        </span>
      </div>

      {/* Justification — the human-readable reason from the backend */}
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        {justification}
      </p>

      {/* Relevant articles — clickable links with date and match percentage */}
      {articles.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-xs font-medium text-zinc-500">Relevant articles:</p>
          {articles.map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg bg-zinc-50 px-3 py-2 text-xs transition-colors hover:bg-zinc-100"
            >
              <span className="block text-zinc-700 truncate">{article.title}</span>
              <span className="mt-0.5 flex items-center gap-2">
                <span className="text-zinc-400">{formatDate(article.published_at)}</span>
                <span className={`font-medium ${matchColor(article.similarity)}`}>
                  {Math.round(article.similarity * 100)}%
                </span>
              </span>
            </a>
          ))}
        </div>
      )}

      {/* Contact info — email, LinkedIn, Twitter */}
      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-3">
        {info.email && (
          <a
            href={`mailto:${info.email}`}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-orange-500 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span className="line-clamp-1">{info.email}</span>
            {info.email_confidence && (
              <span className="text-zinc-300">({Math.round(info.email_confidence * 100)}%)</span>
            )}
          </a>
        )}
        {info.linkedin_url && (
          <a
            href={info.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-orange-500 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
            LinkedIn
          </a>
        )}
        {info.twitter_handle && (
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
            {info.twitter_handle}
          </span>
        )}
      </div>
    </div>
  );
}
