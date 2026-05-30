"use client";

import { GlassCard } from "@/components/glass";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useMemo, useState } from "react";

export type CarModelOption = {
  id: string;
  name: string;
  imageUrl: string;
};

type CarModelPickerProps = {
  cars: CarModelOption[];
  value: string;
  onChange: (carModelId: string) => void;
};

export function CarModelPicker({ cars, value, onChange }: CarModelPickerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cars;
    return cars.filter((car) => car.name.toLowerCase().includes(q));
  }, [cars, query]);

  return (
    <div className="space-y-3">
      {cars.length > 6 ? (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search models..."
          className="glass-input w-full rounded-xl px-3 py-2 text-sm text-foreground"
        />
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-muted">
          No models match your search.
        </p>
      ) : (
        <div className="grid max-h-[min(420px,50vh)] grid-cols-2 gap-2 overflow-y-auto pr-1 dark-scrollbar sm:grid-cols-3">
          {filtered.map((car) => {
            const selected = car.id === value;
            return (
              <button
                key={car.id}
                type="button"
                onClick={() => onChange(car.id)}
                className={cn(
                  "text-left transition",
                  selected && "rounded-xl ring-2 ring-orange-400/60 ring-offset-2 ring-offset-transparent",
                )}
              >
                <GlassCard
                  className={cn(
                    "flex h-full flex-col gap-2 border p-2 transition hover:border-white/25",
                    selected ? "border-orange-400/40 bg-orange-500/10" : "border-white/10",
                  )}
                >
                  <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-black/40 p-1">
                    <Image
                      src={car.imageUrl}
                      alt={car.name}
                      width={120}
                      height={90}
                      unoptimized
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="line-clamp-2 text-xs font-medium leading-snug text-foreground">{car.name}</p>
                </GlassCard>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
