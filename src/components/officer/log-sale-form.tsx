"use client";

import { CarModelPicker, type CarModelOption } from "@/components/officer/car-model-picker";
import { GlassAlert, GlassButton, GlassDatePicker } from "@/components/glass";
import { formatDateDisplay } from "@/lib/date-picker-utils";
import { formatDateInput, monthBoundsUtc } from "@/lib/sale-entry-utils";
import { FormEvent, useEffect, useState } from "react";

export type LogSaleSuccessResult = {
  entry: { carName: string; soldAt: string };
  tierUnlocked: boolean;
  tierLabel: string | null;
  payout: { slabLabel: string; perUnitAmount: number; totalPayout: number };
};

type LogSaleFormProps = {
  monthKey: string;
  cars: CarModelOption[];
  onSuccess: (result: LogSaleSuccessResult) => void;
  submitLabel?: string;
};

export function LogSaleForm({ monthKey, cars, onSuccess, submitLabel = "Log sale" }: LogSaleFormProps) {
  const [carModelId, setCarModelId] = useState("");
  const [soldAt, setSoldAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const { end } = monthBoundsUtc(monthKey);
    const today = new Date();
    const defaultDate = today <= end ? today : end;
    setSoldAt(formatDateInput(defaultDate));
    setCarModelId((current) => (current && cars.some((c) => c.id === current) ? current : ""));
    setError(null);
  }, [monthKey, cars]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/officer/sales/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carModelId, soldAt, monthKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Could not log sale");
      }
      onSuccess({
        entry: { carName: data.entry.carName, soldAt: data.entry.soldAt },
        tierUnlocked: data.tierUnlocked,
        tierLabel: data.tierLabel,
        payout: data.payout,
      });
      setCarModelId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log sale");
    } finally {
      setSubmitting(false);
    }
  }

  const { start, end } = monthBoundsUtc(monthKey);
  const minDate = formatDateInput(start);
  const maxDate = formatDateInput(end);

  if (!cars.length) {
    return (
      <GlassAlert variant="error">
        No car models are available yet. Ask your admin to add vehicles to the catalog.
      </GlassAlert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">1. Choose the car sold</h3>
        <p className="text-xs text-muted">Tap a model below — selected card is highlighted in orange.</p>
        <CarModelPicker cars={cars} value={carModelId} onChange={setCarModelId} />
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">2. When was it sold?</h3>
        <GlassDatePicker
          id="soldAt"
          value={soldAt}
          min={minDate}
          max={maxDate}
          onChange={setSoldAt}
          required
        />
        <p className="text-xs text-muted">
          Sale must fall within the selected month ({formatDateDisplay(minDate)} – {formatDateDisplay(maxDate)}).
        </p>
      </section>

      {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}

      <GlassButton type="submit" variant="accent" className="w-full !py-3" disabled={submitting || !carModelId}>
        {submitting ? "Saving..." : submitLabel}
      </GlassButton>
    </form>
  );
}
