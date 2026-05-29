"use client";

import {
  GlassAlert,
  GlassButton,
  GlassCard,
  GlassSkeleton,
  PageHeader,
} from "@/components/glass";
import { ConfirmDialog, LiveTracker, TierLadder } from "@/components/incentive";
import { calculateIncentive } from "@/lib/incentive";
import type { SlabShape } from "@/lib/incentive-types";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

type Car = { id: string; name: string; imageUrl: string };
type SaleItem = { carModelId: string; units: number };
type SaleResponse = {
  cars: Car[];
  slabs: SlabShape[];
  sale: { items: SaleItem[]; status: "DRAFT" | "SUBMITTED" } | null;
  payout: {
    totalUnits: number;
    slabLabel: string;
    perUnitAmount: number;
    totalPayout: number;
    nextTierDeltaUnits: number | null;
  };
  submitted: boolean;
};

function currentMonthKey() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

export default function OfficerDashboardPage() {
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [cars, setCars] = useState<Car[]>([]);
  const [slabs, setSlabs] = useState<SlabShape[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadMonth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/officer/sales?month=${monthKey}`);
      if (!res.ok) throw new Error("Failed to load sales data");
      const data = (await res.json()) as SaleResponse;
      setCars(data.cars);
      setSlabs(data.slabs ?? []);
      const mapped: Record<string, number> = {};
      for (const car of data.cars) mapped[car.id] = 0;
      data.sale?.items.forEach((item) => {
        mapped[item.carModelId] = item.units;
      });
      setCounts(mapped);
      setSubmitted(data.submitted);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  const totalUnits = useMemo(
    () => Object.values(counts).reduce((sum, value) => sum + value, 0),
    [counts],
  );

  const livePayout = useMemo(() => {
    if (!slabs.length) {
      return {
        totalUnits,
        slabLabel: "No slab configured",
        perUnitAmount: 0,
        totalPayout: 0,
        nextTierDeltaUnits: null,
      };
    }
    return calculateIncentive(totalUnits, slabs);
  }, [totalUnits, slabs]);

  async function saveDraft() {
    setSaving(true);
    setError(null);
    const items = Object.entries(counts).map(([carModelId, units]) => ({ carModelId, units }));
    const res = await fetch("/api/officer/sales", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthKey, items }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error?.formErrors?.[0] ?? "Could not save draft");
      setSaving(false);
      return;
    }
    setSaving(false);
  }

  async function submitMonth() {
    setSubmitError(null);
    const res = await fetch("/api/officer/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthKey }),
    });
    if (!res.ok) {
      setSubmitError("Could not submit month. Save your draft and try again.");
      return;
    }
    setSubmitted(true);
    setConfirmSubmit(false);
  }

  function updateUnits(carId: string, next: number) {
    if (submitted) return;
    setCounts((prev) => ({ ...prev, [carId]: Math.max(0, next) }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Monthly Entry"
        description="Log sold units and track payout in real time."
        actions={
          <input
            type="month"
            value={monthKey}
            onChange={(e) => setMonthKey(e.target.value)}
            className="glass-input rounded-xl px-3 py-2 text-sm"
          />
        }
      />
      <p className="text-xs text-muted">Workflow: choose month → adjust units → save draft → submit final.</p>

      {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}
      {submitError ? <GlassAlert variant="error">{submitError}</GlassAlert> : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {[1, 2, 3].map((i) => (
              <GlassSkeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <GlassSkeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {cars.map((car) => (
              <motion.div
                key={car.id}
                whileHover={{ scale: 1.005 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard className="flex items-center gap-3 border border-white/10 p-3 transition hover:border-white/20 sm:p-4">
                  <Image
                    src={car.imageUrl}
                    alt={car.name}
                    width={220}
                    height={120}
                    className="h-16 w-24 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{car.name}</p>
                    <p className="text-xs text-muted">Units sold this month</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateUnits(car.id, (counts[car.id] ?? 0) - 1)}
                      className="glass-pill rounded-lg p-2 text-muted hover:text-foreground"
                      disabled={submitted}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-mono text-sm font-semibold text-foreground">
                      {counts[car.id] ?? 0}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateUnits(car.id, (counts[car.id] ?? 0) + 1)}
                      className="glass-pill rounded-lg p-2 text-muted hover:text-foreground"
                      disabled={submitted}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <LiveTracker payout={livePayout} submitted={submitted} />
            {slabs.length > 0 ? <TierLadder slabs={slabs} totalUnits={totalUnits} /> : null}
            <div className="flex flex-col gap-2">
              <GlassButton
                type="button"
                variant="secondary"
                onClick={saveDraft}
                disabled={submitted || saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Save draft"}
              </GlassButton>
              <GlassButton
                type="button"
                variant="accent"
                onClick={() => setConfirmSubmit(true)}
                disabled={submitted}
                className="w-full"
              >
                {submitted ? "Submitted" : "Submit month"}
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmSubmit}
        title="Submit this month?"
        message="You will not be able to edit volumes after submission. Make sure your draft is saved."
        confirmLabel="Submit"
        variant="default"
        onConfirm={submitMonth}
        onCancel={() => setConfirmSubmit(false)}
      />
    </div>
  );
}
