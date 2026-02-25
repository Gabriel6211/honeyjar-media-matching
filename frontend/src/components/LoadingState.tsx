interface LoadingStateProps {
  /** Message shown next to the loading dots */
  message?: string;
}

/**
 * Reusable loading indicator with bouncing dots.
 * Used in chat messages and can be reused elsewhere.
 */
export default function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 animate-bounce rounded-full bg-orange-400 [animation-delay:-0.3s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-orange-400 [animation-delay:-0.15s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-orange-400" />
      {message && <span className="ml-1 text-sm text-zinc-400">{message}</span>}
    </div>
  );
}
