"use client";

import { useState } from "react";

interface OptionalInputProps {
  onSubmit: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function OptionalInput({
  onSubmit,
  placeholder,
  disabled,
}: OptionalInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const trimmed = text.trim();
    onSubmit(trimmed.length > 0 ? trimmed : null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm
          text-zinc-700 placeholder-zinc-400 focus:border-orange-300 focus:outline-none
          focus:ring-1 focus:ring-orange-300 disabled:opacity-50"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className="cursor-pointer rounded-lg bg-orange-400 px-4 py-1.5 text-sm font-medium
            text-white transition-colors hover:bg-orange-500 disabled:opacity-50
            disabled:cursor-not-allowed"
        >
          {text.trim().length > 0 ? "Submit" : "Skip"}
        </button>
      </div>
    </div>
  );
}
