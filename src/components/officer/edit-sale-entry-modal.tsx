"use client";

import { CarModelPicker } from "@/components/officer/car-model-picker";
import { GlassAlert, GlassButton, GlassDatePicker, GlassModal } from "@/components/glass";
import { getApiErrorMessage, readJsonOrEmpty } from "@/lib/api-errors";
import type { CarModelOption, EditableSaleEntry } from "@/lib/sale-types";
import { formatDateDisplay } from "@/lib/date-picker-utils";
import { formatDateInput, monthBoundsUtc } from "@/lib/sale-entry-utils";
import { useEffect, useState } from "react";

type EditSaleEntryModalProps = {
  open: boolean;
  entry: EditableSaleEntry | null;
  cars: CarModelOption[];
  monthKey: string;
  onClose: () => void;
  onSaved: () => void;
};

export function EditSaleEntryModal({
  open,
  entry,
  cars,
  monthKey,
  onClose,
  onSaved,
}: EditSaleEntryModalProps) {
  const [carModelId, setCarModelId] = useState("");
  const [soldAt, setSoldAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { start: startDate, end: endDate } = monthBoundsUtc(monthKey);
  const minDate = formatDateInput(startDate);
  const maxDate = formatDateInput(endDate);

  useEffect(() => {
    if (!open || !entry) return;
    setCarModelId(entry.carModelId);
    setSoldAt(formatDateInput(new Date(entry.soldAt)));
    setError(null);
  }, [open, entry]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!entry) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/officer/sales/entries/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carModelId, soldAt }),
      });
      const data = await readJsonOrEmpty(res);
      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, "Could not update sale"));
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update sale");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassModal open={open} onClose={onClose} title="Edit sale">
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-col gap-4">
        {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-0.5 dark-scrollbar">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Car sold</label>
            <CarModelPicker
              cars={cars}
              value={carModelId}
              onChange={setCarModelId}
              variant="compact"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Date sold</label>
            <GlassDatePicker
              value={soldAt}
              min={minDate}
              max={maxDate}
              onChange={setSoldAt}
              required
            />
            <p className="text-xs text-muted">
              Must be in the current month ({formatDateDisplay(minDate)} – {formatDateDisplay(maxDate)}).
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border pt-4 max-lg:gap-2.5 lg:flex-row lg:justify-end">
          <GlassButton
            type="button"
            variant="ghost"
            className="officer-touch w-full max-lg:!min-h-[44px] lg:w-auto"
            onClick={onClose}
          >
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            variant="accent"
            className="officer-touch w-full max-lg:!min-h-[44px] lg:w-auto"
            disabled={submitting || !carModelId}
          >
            {submitting ? "Saving..." : "Save changes"}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}
