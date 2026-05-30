"use client";

import { GlassInput } from "@/components/glass";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ToyotaModelComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

export function ToyotaModelCombobox({ value, onChange, required }: ToyotaModelComboboxProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        const res = await fetch(`/api/admin/toyota-models?${params}`);
        if (res.ok) {
          const data = (await res.json()) as { models: string[] };
          setSuggestions(data.models);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectModel(model: string) {
    onChange(model);
    setQuery(model);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <GlassInput
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search Toyota models..."
          className="pl-9"
          required={required}
        />
      </div>

      {open && (suggestions.length > 0 || loading) ? (
        <ul
          className={cn(
            "absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-white/10",
            "bg-[rgba(20,20,22,0.98)] shadow-xl backdrop-blur-xl",
          )}
        >
          {loading ? (
            <li className="px-3 py-2 text-xs text-muted">Searching...</li>
          ) : (
            suggestions.map((model) => (
              <li key={model}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-white/5"
                  onClick={() => selectModel(model)}
                >
                  {model}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
