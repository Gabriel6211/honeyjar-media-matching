interface EmptyStateProps {
  /** Primary message shown to the user */
  message: string;
  /** Optional secondary hint (e.g. tips for broadening filters) */
  hint?: string;
}

/**
 * Reusable empty state for when no results are found.
 * Used in ResultsList and can be reused elsewhere.
 */
export default function EmptyState({ message, hint }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-6 text-center">
      <p className="text-sm text-zinc-500">{message}</p>
      {hint && (
        <p className="mt-2 text-xs text-zinc-400">{hint}</p>
      )}
    </div>
  );
}
