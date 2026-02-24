interface ErrorStateProps {
  /** Error message shown to the user */
  message: string;
  /** Optional retry handler; when provided, shows a Retry button */
  onRetry?: () => void;
}

/**
 * Reusable error state with optional retry action.
 * Used in chat error messages and can be reused elsewhere.
 */
export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-zinc-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="cursor-pointer self-start rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-100"
        >
          Retry
        </button>
      )}
    </div>
  );
}
