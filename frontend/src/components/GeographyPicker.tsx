"use client";

import { useState } from "react";
import type { Geography } from "@/lib/types";

interface GeographyPickerProps {
  onConfirm: (selected: Geography[]) => void;
  disabled?: boolean;
}

const GEO_OPTIONS: { value: Geography; label: string }[] = [
  { value: "us", label: "US Only" },
  { value: "us_eu_uk", label: "US + EU + UK" },
  { value: "global", label: "Global" },
];

export default function GeographyPicker({ onConfirm, disabled }: GeographyPickerProps) {
  const [selected, setSelected] = useState<Geography[]>([]);

  const toggle = (value: Geography) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {GEO_OPTIONS.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              disabled={disabled}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors
                ${
                  isSelected
                    ? "border-orange-300 bg-orange-50 text-orange-600"
                    : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300"
                }
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => onConfirm(selected)}
        disabled={disabled || selected.length === 0}
        className="cursor-pointer self-start rounded-lg bg-orange-400 px-4 py-1.5 text-sm font-medium
          text-white transition-colors hover:bg-orange-500 disabled:opacity-50
          disabled:cursor-not-allowed"
      >
        Confirm ({selected.length} selected)
      </button>
    </div>
  );
}
