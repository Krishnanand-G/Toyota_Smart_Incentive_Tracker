"use client";

import { GlassAlert, GlassButton, GlassDatePicker, GlassModal } from "@/components/glass";
import { formatDateInput, monthBoundsUtc } from "@/lib/sale-entry-utils";
import { FormEvent, useEffect, useState } from "react";

type CarOption = { id: string; name: string };

type LogSaleModalProps = {
  open: boolean;
  onClose: () => void;
  monthKey: string;
  cars: CarOption[];
  onSuccess: (result: {
    entry: { carName: string; soldAt: string };
    tierUnlocked: boolean;
    tierLabel: string | null;
    payout: { slabLabel: string; perUnitAmount: number; totalPayout: number };
  }) => void;
};

export function LogSaleModal({ open, onClose, monthKey, cars, onSuccess }: LogSaleModalProps) {
  const [carModelId, setCarModelId] = useState("");
  const [soldAt, setSoldAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const { end } = monthBoundsUtc(monthKey);
    const today = new Date();
    const defaultDate = today <= end ? today : end;
    setSoldAt(formatDateInput(defaultDate));
    setCarModelId(cars[0]?.id ?? "");
    setError(null);
  }, [open, monthKey, cars]);

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
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log sale");
    } finally {
      setSubmitting(false);
    }
  }

  const { start, end } = monthBoundsUtc(monthKey);
  const minDate = formatDateInput(start);
  const maxDate = formatDateInput(end);

  return (
    <GlassModal open={open} onClose={onClose} title="Log a sale">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="carModel" className="mb-2 block text-sm text-muted">
            Car model
          </label>
          <select
            id="carModel"
            value={carModelId}
            onChange={(e) => setCarModelId(e.target.value)}
            required
            className="glass-input w-full rounded-xl px-3 py-2 text-sm text-foreground"
          >
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="soldAt" className="mb-2 block text-sm text-muted">
            Date sold
          </label>
          <GlassDatePicker
            id="soldAt"
            value={soldAt}
            min={minDate}
            max={maxDate}
            onChange={setSoldAt}
            required
          />
        </div>

        {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <GlassButton type="button" variant="secondary" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="accent" disabled={submitting || !carModelId}>
            {submitting ? "Saving..." : "Log sale"}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}
