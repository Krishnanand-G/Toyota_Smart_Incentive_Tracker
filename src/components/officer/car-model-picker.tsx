"use client";

import { GlassCard } from "@/components/glass";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useMemo, useState } from "react";

import type { CarModelOption } from "@/lib/sale-types";

type CarModelPickerProps = {
  cars: CarModelOption[];
  value: string;
  onChange: (carModelId: string) => void;
  variant?: "default" | "compact";
};

export function CarModelPicker({
  cars,
  value,
  onChange,
  variant = "default",
}: CarModelPickerProps) {
  const [query, setQuery] = useState("");
  const compact = variant === "compact";

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
          className="glass-input w-full rounded-md px-3 py-2.5 text-sm text-foreground"
        />
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
          No models match your search.
        </p>
      ) : (
        <div
          className={cn(
            "grid w-full min-w-0 gap-2.5 p-0.5",
            compact
              ? "grid-cols-2 sm:grid-cols-3"
              : "max-h-[min(320px,45vh)] grid-cols-1 overflow-y-auto dark-scrollbar sm:grid-cols-2 lg:max-h-[min(420px,55vh)] lg:grid-cols-3",
          )}
        >
          {filtered.map((car) => {
            const selected = car.id === value;
            return (
              <button
                key={car.id}
                type="button"
                onClick={() => onChange(selected ? "" : car.id)}
                className="text-left transition"
              >
                <GlassCard
                  className={cn(
                    "flex h-full flex-col gap-2 border-2 transition hover:border-accent-primary",
                    compact ? "p-2" : "p-2.5 lg:p-2",
                    selected ? "border-accent-primary bg-red-50" : "border-border",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-md bg-background-muted p-1",
                      compact ? "aspect-[3/2]" : "aspect-[3/2] lg:aspect-[4/3]",
                    )}
                  >
                    <Image
                      src={car.imageUrl}
                      alt={car.name}
                      width={120}
                      height={90}
                      unoptimized
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                    {car.name}
                  </p>
                </GlassCard>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
