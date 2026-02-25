"use client";

import type { ChatMessage as ChatMessageType, OutletType, Geography } from "@/lib/types";
import ErrorState from "./ErrorState";
import LoadingState from "./LoadingState";
import OptionalInput from "./OptionalInput";
import OutletPicker from "./OutletPicker";
import GeographyPicker from "./GeographyPicker";
import ResultsList from "./ResultsList";

/**
 * @param message         - The chat message to render (contains role, type, and content)
 * @param onOutletConfirm  - Called when user confirms outlet type selections
 * @param onGeoConfirm     - Called when user confirms geography selections
 * @param onOptionalSubmit - Called when user submits or skips an optional question.
 *                           Receives the text value, or null if skipped.
 * @param onRetry          - Called when user clicks Retry on an error message.
 * @param isLatest         - Whether this is the newest message in the chat.
 *                           Only the latest message renders interactive elements
 *                           (inputs, pickers). Older messages show as static text.
 */
interface ChatMessageProps {
  message: ChatMessageType;
  onOutletConfirm?: (types: OutletType[]) => void;
  onGeoConfirm?: (geo: Geography[]) => void;
  onOptionalSubmit?: (value: string | null) => void;
  onRetry?: () => void;
  isLatest?: boolean;
}

function BotIcon() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8" y2="16" />
        <line x1="16" y1="16" x2="16" y2="16" />
      </svg>
    </div>
  );
}

function UserIcon() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

export default function ChatMessage({
  message,
  onOutletConfirm,
  onGeoConfirm,
  onOptionalSubmit,
  onRetry,
  isLatest,
}: ChatMessageProps) {
  const isSystem = message.role === "system";

  const hasWideContent =
    message.type === "outlet_picker" ||
    message.type === "geography_picker" ||
    message.type === "optional_input" ||
    message.type === "results" ||
    message.type === "error";

  return (
    <div className={`flex items-start gap-2.5 ${isSystem ? "justify-start" : "justify-end"}`}>
      {isSystem && <div className="pt-2.5"><BotIcon /></div>}
      <div
        className={`rounded-2xl px-4 py-3 min-w-0 ${
          hasWideContent ? "flex-1" : "max-w-[80%]"
        } ${
          isSystem
            ? "bg-zinc-50 text-zinc-700 border border-zinc-100"
            : "bg-orange-50 text-zinc-700 border border-orange-100"
        }`}
      >
        {message.type === "text" && (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}

        {message.type === "outlet_picker" && (
          <div className="flex flex-col gap-2">
            <p className="text-sm">{message.content}</p>
            {isLatest && onOutletConfirm && (
              <OutletPicker onConfirm={onOutletConfirm} />
            )}
          </div>
        )}

        {message.type === "geography_picker" && (
          <div className="flex flex-col gap-2">
            <p className="text-sm">{message.content}</p>
            {isLatest && onGeoConfirm && (
              <GeographyPicker onConfirm={onGeoConfirm} />
            )}
          </div>
        )}

        {message.type === "optional_input" && (
          <div className="flex flex-col gap-2">
            <p className="text-sm">{message.content}</p>
            {isLatest && onOptionalSubmit && (
              <OptionalInput
                onSubmit={onOptionalSubmit}
                placeholder={message.content.includes("publications")
                  ? "e.g. TechCrunch, Bloomberg, Wired..."
                  : "e.g. Competitor X just raised $50M..."}
              />
            )}
          </div>
        )}

        {message.type === "loading" && (
          <LoadingState message={message.content} />
        )}

        {message.type === "results" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm">{message.content}</p>
            {message.data && <ResultsList data={message.data} />}
          </div>
        )}

        {message.type === "error" && (
          <ErrorState
            message={message.content}
            onRetry={isLatest && onRetry ? onRetry : undefined}
          />
        )}
      </div>
      {!isSystem && <div className="pt-2.5"><UserIcon /></div>}
    </div>
  );
}
