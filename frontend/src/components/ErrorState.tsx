interface ErrorStateProps {
  /** Error message shown to the user */
  message: string;
}

/**
 * Reusable error state.
 * Used in chat error messages and can be reused elsewhere.
 */
export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-zinc-600">{message}</p>
    </div>
  );
}
