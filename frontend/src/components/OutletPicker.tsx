"use client";

import { useState } from "react";
import type { OutletType } from "@/lib/types";

interface OutletPickerProps {
  onConfirm: (selected: OutletType[]) => void;
  disabled?: boolean;
}

const OUTLET_OPTIONS: { value: OutletType; label: string }[] = [
  { value: "national_business_tech", label: "National Business / Tech" },
  { value: "trade_specialist", label: "Trade / Specialist" },
  { value: "regional", label: "Regional" },
  { value: "newsletter", label: "Newsletters" },
  { value: "podcast", label: "Podcasts" },
];

export default function OutletPicker({ onConfirm, disabled }: OutletPickerProps) {
  const [selected, setSelected] = useState<OutletType[]>([]);

  const toggle = (value: OutletType) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {OUTLET_OPTIONS.map((opt) => {
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
