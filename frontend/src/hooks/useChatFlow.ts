"use client";

import { useState } from "react";
import type {
  ChatMessage as ChatMessageType,
  OutletType,
  Geography,
  SearchRequest,
} from "@/lib/types";
import { searchReporters } from "@/lib/api";
import { systemMsg, userMsg } from "@/lib/chatUtils";

export type Step =
  | "brief"
  | "outlets"
  | "geography"
  | "focus_publications"
  | "competitors"
  | "searching"
  | "refining"
  | "results";

export interface UseChatFlowReturn {
  messages: ChatMessageType[];
  step: Step;
  handleBriefSubmit: (text: string) => void;
  handleOutletConfirm: (selected: OutletType[]) => void;
  handleGeoConfirm: (selected: Geography[]) => void;
  handleFocusPublications: (value: string | null) => void;
  handleCompetitors: (value: string | null) => Promise<void>;
  handleRefinement: (text: string) => Promise<void>;
  handleNewSearch: () => void;
  optionalHandler: ((value: string | null) => void | Promise<void>) | undefined;
  inputText: string;
  setInputText: (value: string) => void;
  handleInputSend: () => void;
  handleInputKeyDown: (e: React.KeyboardEvent) => void;
  isInputActive: boolean;
  isLoading: boolean;
}

/**
 * Manages the chat flow state machine: brief → outlets → geography →
 * focus_publications → competitors → search → results. Handles refinement
 * (re-search with blended vectors) and new search (reset).
 */
export function useChatFlow(): UseChatFlowReturn {
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
  const [refinements, setRefinements] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");

  /**
   * Calls the search API, shows loading, then replaces with results or error.
   * Used by handleCompetitors (initial search) and handleRefinement (follow-up search).
   *
   * @param request - Search params: brief, refinements (optional), outlet_types, geography,
   *   focus_publications, competitors. When refinements exist, backend blends brief + refinement
   *   vectors for more relevant results.
   * @param options.loadingMessage - Text shown in the loading bubble (e.g. "Searching for matching reporters...").
   * @param options.successMessage - Function that receives the total count and returns the results
   *   message (e.g. "Found 12 matching reporters! Here are the top matches:").
   * @param options.stepWhileLoading - Step used during the request ("searching" or "refining");
   *   affects cursor and aria-busy state.
   * @param options.errorFallback - Fallback error message if the API throws without a message.
   */
  const runSearch = async (
    request: SearchRequest,
    options: {
      loadingMessage: string;
      successMessage: (total: number) => string;
      stepWhileLoading: "searching" | "refining";
      errorFallback: string;
    }
  ) => {
    const doSearch = async () => {
      try {
        const result = await searchReporters(request);
        setMessages((prev) => {
          const withoutLoading = prev.filter((m) => m.type !== "loading");
          const withoutError = withoutLoading.filter((m) => m.type !== "error");
          return [
            ...withoutError,
            systemMsg(options.successMessage(result.total), "results", result),
          ];
        });
        setStep("results");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : options.errorFallback;
        setMessages((prev) => {
          const withoutLoading = prev.filter((m) => m.type !== "loading");
          const withoutError = withoutLoading.filter((m) => m.type !== "error");
          return [
            ...withoutError,
            systemMsg(`Something went wrong: ${errorMessage}.`, "error"),
          ];
        });
        setStep("results");
      }
    };
    await doSearch();
  };

  /** Saves the brief and advances to outlet type selection. */
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

  /** Saves outlet types and advances to geography selection. */
  const handleOutletConfirm = (selected: OutletType[]) => {
    setOutletTypes(selected);
    // Convert the outlet types to a comma-separated list of labels
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

  /** Saves geography and advances to focus publications (optional). */
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

  /** Saves focus publications (or skip) and advances to competitors (optional). */
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

  /** Saves competitors (or skip), runs the initial search, and shows results. */
  const handleCompetitors = async (value: string | null) => {
    const competitorValue = value ?? undefined;
    setCompetitors(competitorValue);
    setMessages((prev) => [
      ...prev,
      userMsg(value ?? "Skipped"),
      systemMsg("Searching for matching reporters...", "loading"),
    ]);
    setStep("searching");

    await runSearch(
      {
        brief,
        outlet_types: outletTypes.length > 0 ? outletTypes : undefined,
        geography: geography.length > 0 ? geography : undefined,
        focus_publications: focusPublications,
        competitors: competitorValue,
      },
      {
        loadingMessage: "Searching for matching reporters...",
        successMessage: (total) =>
          `Found ${total} matching reporter${total !== 1 ? "s" : ""}! Here are the top matches:`,
        stepWhileLoading: "searching",
        errorFallback: "Search failed",
      }
    );
  };

  /** Appends the refinement text, re-runs search with blended vectors, and shows updated results. */
  const handleRefinement = async (text: string) => {
    const updatedRefinements = [...refinements, text];
    setRefinements(updatedRefinements);
    setMessages((prev) => [
      ...prev,
      userMsg(text),
      systemMsg("Refining your search...", "loading"),
    ]);
    setStep("refining");

    await runSearch(
      {
        brief,
        refinements: updatedRefinements,
        outlet_types: outletTypes.length > 0 ? outletTypes : undefined,
        geography: geography.length > 0 ? geography : undefined,
        focus_publications: focusPublications,
        competitors,
      },
      {
        loadingMessage: "Refining your search...",
        successMessage: (total) =>
          `Updated results: ${total} reporter${total !== 1 ? "s" : ""} found.`,
        stepWhileLoading: "refining",
        errorFallback: "Refinement failed",
      }
    );
  };

  /** Resets all state and returns the flow to the initial brief step. */
  const handleNewSearch = () => {
    setBrief("");
    setOutletTypes([]);
    setGeography([]);
    setFocusPublications(undefined);
    setCompetitors(undefined);
    setRefinements([]);
    setInputText("");
    setMessages([
      systemMsg(
        "Starting fresh! Paste your story brief below and I'll find the best reporters to pitch."
      ),
    ]);
    setStep("brief");
  };

  /** Resolves to handleFocusPublications or handleCompetitors based on current step. */
  const optionalHandler =
    step === "focus_publications"
      ? handleFocusPublications
      : step === "competitors"
        ? handleCompetitors
        : undefined;

  /** Sends the input: submits brief if on brief step, or refinement if on results step. */
  const handleInputSend = () => {
    const trimmed = inputText.trim();
    if (trimmed.length === 0) return;
    setInputText("");
    if (step === "brief") {
      handleBriefSubmit(trimmed);
    } else if (step === "results") {
      handleRefinement(trimmed);
    }
  };

  /** Submits on Enter (without Shift). */
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleInputSend();
    }
  };

  const isInputActive = step === "brief" || step === "results";
  const isLoading = step === "searching" || step === "refining";

  return {
    messages,
    step,
    handleBriefSubmit,
    handleOutletConfirm,
    handleGeoConfirm,
    handleFocusPublications,
    handleCompetitors,
    handleRefinement,
    handleNewSearch,
    optionalHandler,
    inputText,
    setInputText,
    handleInputSend,
    handleInputKeyDown,
    isInputActive,
    isLoading,
  };
}
