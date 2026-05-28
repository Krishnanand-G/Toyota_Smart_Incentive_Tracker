"use client";

import { GlassBadge, GlassCard, GlassInput, GlassModal } from "@/components/glass";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type CarModel = {
  id: string;
  name: string;
  imageUrl: string;
  description: string | null;
  sortOrder: number;
};

const emptyForm = { name: "", imageUrl: "", description: "", sortOrder: 0 };

export default function AdminCarsPage() {
  const [cars, setCars] = useState<CarModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CarModel | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadCars() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/cars");
      if (!res.ok) throw new Error("Failed to load cars");
      const data = (await res.json()) as CarModel[];
      setCars(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load cars");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCars();
  }, []);

  const submitLabel = useMemo(() => (editing ? "Save changes" : "Add car model"), [editing]);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function startEdit(car: CarModel) {
    setEditing(car);
    setForm({
      name: car.name,
      imageUrl: car.imageUrl,
      description: car.description ?? "",
      sortOrder: car.sortOrder,
    });
    setOpen(true);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      ...form,
      sortOrder: Number(form.sortOrder),
    };

    const endpoint = editing ? `/api/admin/cars/${editing.id}` : "/api/admin/cars";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error?.formErrors?.[0] ?? "Could not save car");
      return;
    }

    setOpen(false);
    await loadCars();
  }

  async function removeCar(id: string) {
    const ok = window.confirm("Soft-delete this car model?");
    if (!ok) return;
    const res = await fetch(`/api/admin/cars/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Could not delete car model");
      return;
    }
    await loadCars();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GlassBadge variant="blue">Stage 3</GlassBadge>
          <p className="text-sm text-slate-600">Manage Toyota models shown to officers.</p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="glass-pill rounded-full px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white/70"
        >
          Add model
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading car models...</p>}
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {!loading && !cars.length && !error && (
        <GlassCard className="p-6 text-sm text-slate-600">No car models yet. Add your first model.</GlassCard>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cars.map((car) => (
          <GlassCard key={car.id} className="overflow-hidden p-3 transition duration-200 hover:-translate-y-0.5">
            <Image
              src={car.imageUrl}
              alt={car.name}
              width={640}
              height={320}
              className="h-44 w-full rounded-xl object-cover"
            />
            <div className="mt-3 space-y-2 px-1 pb-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-900">{car.name}</h3>
                <GlassBadge>{`#${car.sortOrder}`}</GlassBadge>
              </div>
              <p className="min-h-10 text-sm text-slate-600">{car.description || "No description"}</p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => startEdit(car)}
                  className="glass-pill rounded-full px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => removeCar(car.id)}
                  className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassModal open={open} onClose={() => setOpen(false)} title={editing ? "Edit car model" : "Add car model"}>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Model Name</label>
            <GlassInput
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Image URL</label>
            <GlassInput
              value={form.imageUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <GlassInput
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Sort Order</label>
            <GlassInput
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))}
            />
          </div>
          {form.imageUrl ? (
            <Image
              src={form.imageUrl}
              alt="Preview"
              width={640}
              height={260}
              className="h-40 w-full rounded-xl object-cover"
            />
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="glass-pill rounded-full px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white">
              {submitLabel}
            </button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
