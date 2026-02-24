import type { SearchResponse } from "./types";

/**
 * Generates a CSV string from search results.
 *
 * Columns: Rank, Name, Outlet, Match Score, Email, Email Confidence,
 * LinkedIn, Twitter, Justification, Article 1 Title, Article 1 URL,
 * Article 2 Title, Article 2 URL, Article 3 Title, Article 3 URL.
 *
 * Values containing commas or quotes are wrapped in double quotes
 * with internal quotes escaped (standard CSV escaping).
 */
export function generateCsv(data: SearchResponse): string {
  const headers = [
    "Rank",
    "Name",
    "Outlet",
    "Match Score",
    "Email",
    "Email Confidence",
    "LinkedIn",
    "Twitter",
    "Justification",
    "Article 1 Title",
    "Article 1 URL",
    "Article 2 Title",
    "Article 2 URL",
    "Article 3 Title",
    "Article 3 URL",
  ];

  const rows = data.reporters.map((r, idx) => {
    const info = r.reporter;
    return [
      idx + 1,
      info.name,
      info.outlet,
      `${Math.round(r.score * 100)}%`,
      info.email ?? "",
      info.email_confidence ? `${Math.round(info.email_confidence * 100)}%` : "",
      info.linkedin_url ?? "",
      info.twitter_handle ?? "",
      r.justification,
      r.articles[0]?.title ?? "",
      r.articles[0]?.url ?? "",
      r.articles[1]?.title ?? "",
      r.articles[1]?.url ?? "",
      r.articles[2]?.title ?? "",
      r.articles[2]?.url ?? "",
    ];
  });

  const csvLines = [headers, ...rows].map((row) =>
    row.map((cell) => escapeCsvCell(String(cell))).join(",")
  );

  return csvLines.join("\n");
}

/**
 * Escapes a CSV cell value. If the value contains commas, quotes,
 * or newlines, it's wrapped in double quotes with internal quotes doubled.
 */
function escapeCsvCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Triggers a browser file download from a string content.
 * Creates a temporary Blob URL, clicks a hidden <a> tag, then cleans up.
 */
export function downloadCsv(data: SearchResponse, filename = "reporters.csv"): void {
  const csv = generateCsv(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Builds a comma-separated email string from all reporters that have emails.
 * Ready to paste into an email client's "To" field.
 * e.g. "john.doe@techcrunch.com, jane.smith@bloomberg.com"
 */
export function buildEmailString(data: SearchResponse): string {
  return data.reporters
    .map((r) => r.reporter.email)
    .filter((email): email is string => email !== null && email !== undefined)
    .join(", ");
}

/**
 * Copies text to the clipboard using the modern Clipboard API.
 * Returns true if successful, false otherwise.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
