"use client";

import { useState } from "react";
import type { SearchResponse } from "@/lib/types";
import { downloadCsv, buildEmailString, copyToClipboard } from "@/lib/export";
import EmptyState from "./EmptyState";
import ReporterCard from "./ReporterCard";

interface ResultsListProps {
  data: SearchResponse;
}

/**
 * Renders the full search results — a header with export actions
 * followed by a vertically stacked list of ReporterCards.
 * Each reporter gets a rank number (1-based) passed to the card.
 */
export default function ResultsList({ data }: ResultsListProps) {
  const [copyLabel, setCopyLabel] = useState("Copy Emails");

  if (data.reporters.length === 0) {
    return (
      <EmptyState
        message="No matching reporters found."
        hint='Try selecting more outlet types, choosing "Global" geography, or adjusting your brief.'
      />
    );
  }

  const handleDownloadCsv = () => {
    downloadCsv(data);
  };

  /**
   * Copies all reporter emails to clipboard and shows brief feedback.
   * The button text changes to "Copied!" for 2 seconds, then reverts.
   */
  const handleCopyEmails = async () => {
    const emailString = buildEmailString(data);
    if (emailString.length === 0) {
      setCopyLabel("No emails found");
      setTimeout(() => setCopyLabel("Copy Emails"), 2000);
      return;
    }

    const success = await copyToClipboard(emailString);
    setCopyLabel(success ? "Copied!" : "Failed");
    setTimeout(() => setCopyLabel("Copy Emails"), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500">
          {data.total} reporter{data.total !== 1 ? "s" : ""} found
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyEmails}
            className="cursor-pointer rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600
              transition-colors hover:bg-zinc-50"
          >
            {copyLabel}
          </button>
          <button
            onClick={handleDownloadCsv}
            className="cursor-pointer rounded-lg bg-orange-400 px-3 py-1.5 text-xs font-medium text-white
              transition-colors hover:bg-orange-500"
          >
            Download CSV
          </button>
        </div>
      </div>
      {data.reporters.map((reporter, idx) => (
        <ReporterCard key={idx} reporter={reporter} rank={idx + 1} />
      ))}
    </div>
  );
}
