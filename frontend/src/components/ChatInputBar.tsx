interface ChatInputBarProps {
  step: "brief" | "outlets" | "geography" | "focus_publications" | "competitors" | "searching" | "refining" | "results";
  inputText: string;
  onInputChange: (value: string) => void;
  onInputKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  onNewSearch?: () => void;
  disabled?: boolean;
}

export default function ChatInputBar({
  step,
  inputText,
  onInputChange,
  onInputKeyDown,
  onSend,
  onNewSearch,
  disabled = false,
}: ChatInputBarProps) {
  const placeholder =
    step === "brief"
      ? "Type your story brief..."
      : step === "results"
        ? "Refine your search, e.g. 'Focus on Bloomberg reporters'..."
        : "Complete the steps above...";

  const isInputActive = step === "brief" || step === "results";
  const showNewSearch = step === "results";

  return (
    <div className="border-t border-zinc-100 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        {showNewSearch && onNewSearch && (
          <button
            onClick={onNewSearch}
            title="Start a new search"
            className="cursor-pointer flex h-9 w-9 shrink-0 items-center justify-center rounded-full
              border border-zinc-200 text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M21 21v-5h-5" />
            </svg>
          </button>
        )}
        <input
          type="text"
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onInputKeyDown}
          disabled={!isInputActive || disabled}
          placeholder={placeholder}
          className="flex-1 rounded-full border border-zinc-200 px-4 py-2.5 text-sm
            text-zinc-700 placeholder-zinc-400 focus:border-orange-300 focus:outline-none
            focus:ring-1 focus:ring-orange-300 disabled:bg-zinc-50 disabled:opacity-60"
        />
        <button
          onClick={onSend}
          disabled={!isInputActive || inputText.trim().length === 0 || disabled}
          className="cursor-pointer flex h-9 w-9 shrink-0 items-center justify-center rounded-full
            bg-orange-400 text-white transition-colors hover:bg-orange-500
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
