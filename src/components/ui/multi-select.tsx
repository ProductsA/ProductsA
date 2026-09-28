"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, X } from "lucide-react";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  error,
  required,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  function toggleOption(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  }

  function selectAll() {
    onChange(options.map((o) => o.value));
  }

  function clearAll() {
    onChange([]);
  }

  function removeOption(optionValue: string, e: React.MouseEvent) {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  }

  const selectedLabels = options.filter((o) => value.includes(o.value));

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex min-h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          error ? "border-destructive focus-visible:ring-destructive" : "border-input",
          value.length === 0 && "text-muted-foreground"
        )}
      >
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {selectedLabels.length === 0 ? (
            <span>{placeholder}</span>
          ) : (
            selectedLabels.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
              >
                {opt.label}
                <button
                  type="button"
                  onClick={(e) => removeOption(opt.value, e)}
                  className="hover:text-primary/70"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 opacity-50 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-md animate-slide-down">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-primary hover:underline font-medium"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:underline font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {options.map((opt) => {
              const isSelected = value.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleOption(opt.value)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted transition-colors text-left",
                    isSelected && "bg-muted"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                      isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <span className="flex-1">{opt.label}</span>
                </button>
              );
            })}
            {options.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">No options available</p>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
