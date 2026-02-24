"use client";

import { useState } from "react";
import type { RankedReporter, ReporterArticle } from "@/lib/types";
import { copyToClipboard } from "@/lib/export";

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

/**
 * Renders the justification text with the quoted article title replaced
 * by a clickable hyperlink. The backend wraps the title in double quotes,
 * e.g. '..."Some Article Title"...'. We find that quoted substring,
 * match it to an article by title, and render it as an <a> tag.
 * If no match is found, falls back to plain text.
 */
function LinkedJustification({
  text,
  articles,
}: {
  text: string;
  articles: ReporterArticle[];
}) {
  // Find quoted text in the justification (the article title)
  const quoteMatch = text.match(/"([^"]+)"/);
  if (!quoteMatch) return <>{text}</>;

  const quotedTitle = quoteMatch[1];
  const matchingArticle = articles.find((a) => a.title === quotedTitle);

  if (!matchingArticle) return <>{text}</>;

  const beforeQuote = text.slice(0, quoteMatch.index);
  const afterQuote = text.slice(quoteMatch.index! + quoteMatch[0].length);

  return (
    <>
      {beforeQuote}
      <a
        href={matchingArticle.url}
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer font-medium text-orange-500 underline hover:text-orange-600"
      >
        {quotedTitle}
      </a>
      {afterQuote}
    </>
  );
}

export default function ReporterCard({ reporter, rank }: ReporterCardProps) {
  const { reporter: info, score, justification, articles } = reporter;
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = async () => {
    if (!info.email) return;
    const ok = await copyToClipboard(info.email);
    if (ok) {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

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

      {/* Justification — human-readable reason with the top article title as a link */}
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        <LinkedJustification text={justification} articles={articles} />
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
              className="block cursor-pointer rounded-lg bg-zinc-50 px-3 py-2 text-xs transition-colors hover:bg-zinc-100"
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
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            <a
              href={`mailto:${info.email}`}
              className="cursor-pointer flex items-center gap-1 hover:text-orange-500 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span className="line-clamp-1">{info.email}</span>
            </a>
            {info.email_confidence && (
              <span className="text-zinc-300">({Math.round(info.email_confidence * 100)}%)</span>
            )}
            <button
              onClick={handleCopyEmail}
              className="cursor-pointer text-zinc-400 hover:text-orange-500 transition-colors"
              title="Copy email"
            >
              {emailCopied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </span>
        )}
        {info.linkedin_url && (
          <a
            href={info.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer flex items-center gap-1 text-xs text-zinc-500 hover:text-orange-500 transition-colors"
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
            <svg width="12" height="12" viewBox="0 0 1200 1227" fill="currentColor">
              <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
            </svg>
            {info.twitter_handle}
          </span>
        )}
      </div>
    </div>
  );
}
