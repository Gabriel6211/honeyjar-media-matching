"use client";

import { useState, useRef, useEffect } from "react";
import type {
  ChatMessage as ChatMessageType,
  OutletType,
  Geography,
  SearchResponse,
} from "@/lib/types";
import { searchReporters } from "@/lib/api";
import ChatMessage from "./ChatMessage";

/**
 * The conversation is a linear state machine.
 * Each step corresponds to one question in the chat flow.
 * The user must complete steps in order: brief → outlets → geography →
 * focus_publications → competitors → searching → results.
 */
type Step =
  | "brief"
  | "outlets"
  | "geography"
  | "focus_publications"
  | "competitors"
  | "searching"
  | "results";

let messageId = 0;
function nextId(): string {
  return `msg-${++messageId}`;
}

/**
 * Creates a system (left-aligned) chat message.
 *
 * @param content - The text shown inside the bubble
 * @param type    - Controls which UI renders inside the bubble:
 *                  "text" = plain text, "outlet_picker" = multi-select pills,
 *                  "optional_input" = text field with skip, etc.
 *                  Defaults to "text".
 * @param data    - Optional search results payload, attached to the message
 *                  so the results view can read it later.
 */
function systemMsg(
  content: string,
  type: ChatMessageType["type"] = "text",
  data?: SearchResponse
): ChatMessageType {
  return { id: nextId(), role: "system", type, content, data };
}

/**
 * Creates a user (right-aligned) chat message.
 * Always renders as plain text — it's just the user's answer echoed back.
 *
 * @param content - The text the user submitted (brief, selected labels, etc.)
 */
function userMsg(content: string): ChatMessageType {
  return { id: nextId(), role: "user", type: "text", content };
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    systemMsg(
      "Welcome to HoneyJar Media Matching! Paste your story brief below and I'll find the best reporters to pitch."
    ),
  ]);
  const [step, setStep] = useState<Step>("brief");
  const [brief, setBrief] = useState("");
  const [outletTypes, setOutletTypes] = useState<OutletType[]>([]);
  const [geography, setGeography] = useState<Geography[]>([]);
  const [focusPublications, setFocusPublications] = useState<string | undefined>();
  const [competitors, setCompetitors] = useState<string | undefined>();
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleBriefSubmit = (text: string) => {
    setBrief(text);
    setMessages((prev) => [
      ...prev,
      userMsg(text),
      systemMsg(
        "What type of outlets are you targeting? Select one or more:",
        "outlet_picker"
      ),
    ]);
    setStep("outlets");
  };

  /**
   * Converts internal values like "national_business_tech" to readable
   * labels like "National Business Tech" for the user message bubble.
   */
  const handleOutletConfirm = (selected: OutletType[]) => {
    setOutletTypes(selected);
    const labels = selected
      .map((s) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
      .join(", ");

    setMessages((prev) => [
      ...prev,
      userMsg(labels),
      systemMsg(
        "What geographic focus for your search? Select one or more:",
        "geography_picker"
      ),
    ]);
    setStep("geography");
  };

  const handleGeoConfirm = (selected: Geography[]) => {
    setGeography(selected);
    const labels = selected
      .map((g) => {
        if (g === "us") return "US Only";
        if (g === "us_eu_uk") return "US + EU + UK";
        return "Global";
      })
      .join(", ");

    setMessages((prev) => [
      ...prev,
      userMsg(labels),
      systemMsg(
        "Are there any specific publications I should focus on finding best-fit contacts at? (optional)",
        "optional_input"
      ),
    ]);
    setStep("focus_publications");
  };

  const handleFocusPublications = (value: string | null) => {
    setFocusPublications(value ?? undefined);
    setMessages((prev) => [
      ...prev,
      userMsg(value ?? "Skipped"),
      systemMsg(
        "Are there any competitors or other announcements I should consider when running your search? (optional)",
        "optional_input"
      ),
    ]);
    setStep("competitors");
  };

  /**
   * Final step before searching. Collects all accumulated state
   * (brief, outlet types, geography, focus publications, competitors)
   * and sends it to the backend. Shows a loading indicator while waiting,
   * then replaces it with results or an error message.
   */
  const handleCompetitors = async (value: string | null) => {
    const competitorValue = value ?? undefined;
    setCompetitors(competitorValue);
    setMessages((prev) => [
      ...prev,
      userMsg(value ?? "Skipped"),
      systemMsg("Searching for matching reporters...", "loading"),
    ]);
    setStep("searching");

    try {
      const result = await searchReporters({
        brief,
        outlet_types: outletTypes.length > 0 ? outletTypes : undefined,
        geography: geography.length > 0 ? geography : undefined,
        focus_publications: focusPublications,
        competitors: competitorValue,
      });

      setSearchResult(result);
      setMessages((prev) => {
        const withoutLoading = prev.filter((m) => m.type !== "loading");
        return [
          ...withoutLoading,
          systemMsg(
            `Found ${result.total} matching reporter${result.total !== 1 ? "s" : ""}! Here are the top matches:`,
            "results",
            result
          ),
        ];
      });
      setStep("results");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed";
      setMessages((prev) => {
        const withoutLoading = prev.filter((m) => m.type !== "loading");
        return [
          ...withoutLoading,
          systemMsg(`Something went wrong: ${errorMessage}. Please try again.`),
        ];
      });
      setStep("results");
    }
  };

  // Determine which handler to pass based on the current step
  const optionalHandler =
    step === "focus_publications"
      ? handleFocusPublications
      : step === "competitors"
        ? handleCompetitors
        : undefined;

  const [inputText, setInputText] = useState("");

  const handleInputSend = () => {
    const trimmed = inputText.trim();
    if (trimmed.length === 0) return;
    setInputText("");

    if (step === "brief") {
      handleBriefSubmit(trimmed);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleInputSend();
    }
  };

  const isInputActive = step === "brief";

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((msg, idx) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isLatest={idx === messages.length - 1}
              onOutletConfirm={step === "outlets" ? handleOutletConfirm : undefined}
              onGeoConfirm={step === "geography" ? handleGeoConfirm : undefined}
              onOptionalSubmit={optionalHandler}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="border-t border-zinc-100 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={!isInputActive}
            placeholder={isInputActive ? "Type your story brief..." : "Complete the steps above..."}
            className="flex-1 rounded-full border border-zinc-200 px-4 py-2.5 text-sm
              text-zinc-700 placeholder-zinc-400 focus:border-orange-300 focus:outline-none
              focus:ring-1 focus:ring-orange-300 disabled:bg-zinc-50 disabled:opacity-60"
          />
          <button
            onClick={handleInputSend}
            disabled={!isInputActive || inputText.trim().length === 0}
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
    </div>
  );
}
