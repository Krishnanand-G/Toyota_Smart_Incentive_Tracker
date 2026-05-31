"use client";

import { GlassInput } from "@/components/glass";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type SearchableComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  emptyMessage?: string;
};

export function SearchableCombobox({
  value,
  onChange,
  options,
  placeholder = "Search...",
  loading = false,
  disabled = false,
  required,
  emptyMessage = "No matches",
}: SearchableComboboxProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectOption(option: string) {
    const next = value === option ? "" : option;
    onChange(next);
    setQuery(next);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <GlassInput
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => !disabled && setOpen(true)}
          placeholder={placeholder}
          className="pl-9"
          required={required}
        />
      </div>

      {open && !disabled && (filtered.length > 0 || loading) ? (
        <ul
          className={cn(
            "absolute z-[60] mt-1 max-h-60 w-full overflow-y-auto rounded-md lg:max-h-48",
            "border border-[var(--glass-border)] bg-[var(--glass-elevated)]",
            "shadow-[var(--glass-shadow-elevated)] dark-scrollbar",
          )}
        >
          {loading ? (
            <li className="px-3 py-2 text-xs text-muted">Loading...</li>
          ) : filtered.length ? (
            filtered.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm text-foreground transition",
                    "hover:bg-[var(--glass-soft)]",
                    value === option && "bg-[var(--glass-soft)] font-medium",
                  )}
                  onClick={() => selectOption(option)}
                >
                  {option}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-xs text-muted">{emptyMessage}</li>
          )}
        </ul>
      ) : null}
    </div>
  );
}
