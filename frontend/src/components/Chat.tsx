"use client";

import { useEffect, useRef } from "react";
import { useChatFlow } from "@/hooks/useChatFlow";
import ChatInputBar from "./ChatInputBar";
import ChatMessage from "./ChatMessage";

export default function Chat() {
  const {
    messages,
    step,
    handleOutletConfirm,
    handleGeoConfirm,
    optionalHandler,
    inputText,
    setInputText,
    handleInputSend,
    handleInputKeyDown,
    isLoading,
    retrySearchRef,
    handleNewSearch,
  } = useChatFlow();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={`flex h-full flex-col ${isLoading ? "cursor-wait" : ""}`}
      aria-busy={isLoading}
    >
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
              onRetry={
                msg.type === "error" && idx === messages.length - 1
                  ? () => retrySearchRef.current?.()
                  : undefined
              }
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <ChatInputBar
        step={step}
        inputText={inputText}
        onInputChange={setInputText}
        onInputKeyDown={handleInputKeyDown}
        onSend={handleInputSend}
        onNewSearch={handleNewSearch}
        disabled={isLoading}
      />
    </div>
  );
}
