"use client";

import type { SearchResponse } from "@/lib/types";
import ReporterCard from "./ReporterCard";

interface ResultsListProps {
  data: SearchResponse;
}

/**
 * Renders the full search results — a header with the total count
 * followed by a vertically stacked list of ReporterCards.
 * Each reporter gets a rank number (1-based) passed to the card.
 */
export default function ResultsList({ data }: ResultsListProps) {
  if (data.reporters.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white px-4 py-6 text-center">
        <p className="text-sm text-zinc-500">
          No matching reporters found. Try broadening your filters or adjusting your brief.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500">
          {data.total} reporter{data.total !== 1 ? "s" : ""} found
        </p>
      </div>
      {data.reporters.map((reporter, idx) => (
        <ReporterCard key={idx} reporter={reporter} rank={idx + 1} />
      ))}
    </div>
  );
}
