"use client";

import { GlassBadge, GlassCard } from "@/components/glass";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

type Car = { id: string; name: string; imageUrl: string };
type SaleItem = { carModelId: string; units: number };
type SaleResponse = {
  cars: Car[];
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
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [payout, setPayout] = useState<SaleResponse["payout"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMonth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/officer/sales?month=${monthKey}`);
      if (!res.ok) throw new Error("Failed to load sales data");
      const data = (await res.json()) as SaleResponse;
      setCars(data.cars);
      const mapped: Record<string, number> = {};
      for (const car of data.cars) mapped[car.id] = 0;
      data.sale?.items.forEach((item) => {
        mapped[item.carModelId] = item.units;
      });
      setCounts(mapped);
      setPayout(data.payout);
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
    setPayout(data.payout);
    setSaving(false);
  }

  async function submitMonth() {
    const ok = window.confirm("Submit this month? You will not be able to edit it.");
    if (!ok) return;
    const res = await fetch("/api/officer/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthKey }),
    });
    if (!res.ok) {
      alert("Could not submit month");
      return;
    }
    setSubmitted(true);
  }

  function updateUnits(carId: string, next: number) {
    if (submitted) return;
    setCounts((prev) => ({ ...prev, [carId]: Math.max(0, next) }));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GlassBadge variant="blue">Stage 5</GlassBadge>
          <p className="text-sm text-slate-600">Submit monthly sales and preview payout instantly.</p>
        </div>
        <input
          type="month"
          value={monthKey}
          onChange={(e) => setMonthKey(e.target.value)}
          className="glass-input rounded-xl px-3 py-2 text-sm"
        />
      </div>

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="text-sm text-slate-500">Loading monthly sales...</p> : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cars.map((car) => (
            <GlassCard key={car.id} className="flex items-center gap-3 p-3">
              <Image
                src={car.imageUrl}
                alt={car.name}
                width={220}
                height={120}
                className="h-16 w-24 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{car.name}</p>
                <p className="text-xs text-slate-500">Units sold this month</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateUnits(car.id, (counts[car.id] ?? 0) - 1)}
                  className="glass-pill rounded-full p-2 text-slate-700"
                  disabled={submitted}
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-slate-900">{counts[car.id] ?? 0}</span>
                <button
                  type="button"
                  onClick={() => updateUnits(car.id, (counts[car.id] ?? 0) + 1)}
                  className="glass-pill rounded-full p-2 text-slate-700"
                  disabled={submitted}
                >
                  <Plus size={16} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="h-fit space-y-3 p-4">
          <h3 className="text-sm font-semibold text-slate-800">Payout preview</h3>
          <div className="space-y-1 text-sm text-slate-600">
            <p>Total units: <span className="font-semibold text-slate-900">{totalUnits}</span></p>
            <p>Current tier: <span className="font-semibold text-slate-900">{payout?.slabLabel ?? "-"}</span></p>
            <p>Per unit: <span className="font-semibold text-slate-900">{(payout?.perUnitAmount ?? 0).toLocaleString()}</span></p>
            <p className="text-base font-bold text-blue-700">
              Total payout: {(payout?.totalPayout ?? 0).toLocaleString()}
            </p>
            {payout?.nextTierDeltaUnits !== null && payout?.nextTierDeltaUnits !== undefined ? (
              <p className="text-xs text-amber-700">Need {payout.nextTierDeltaUnits} more units for next tier.</p>
            ) : (
              <p className="text-xs text-emerald-700">Top tier reached.</p>
            )}
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={saveDraft}
              disabled={submitted || saving}
              className="glass-pill rounded-full px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save draft"}
            </button>
            <button
              type="button"
              onClick={submitMonth}
              disabled={submitted}
              className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitted ? "Submitted" : "Submit month"}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
