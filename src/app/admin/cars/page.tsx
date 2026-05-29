"use client";

import {
  GlassAlert,
  GlassBadge,
  GlassButton,
  GlassCard,
  GlassInput,
  GlassModal,
  GlassSkeleton,
  PageHeader,
} from "@/components/glass";
import { ConfirmDialog } from "@/components/incentive";
import { motion } from "framer-motion";
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
  const [formError, setFormError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CarModel | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
    setFormError(null);
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
    setFormError(null);
    setOpen(true);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
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
      setFormError(data?.error?.formErrors?.[0] ?? "Could not save car");
      return;
    }

    setOpen(false);
    await loadCars();
  }

  async function removeCar(id: string) {
    const res = await fetch(`/api/admin/cars/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Could not delete car model");
      return;
    }
    setDeleteId(null);
    await loadCars();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Inventory"
        description="Maintain showroom lineup for officer submissions."
        actions={
          <div className="flex items-center gap-4">
            <div className="glass-section px-4 py-2 text-center">
              <p className="font-mono text-xl font-semibold text-foreground">{cars.length}</p>
              <p className="text-xs text-muted">Active models</p>
            </div>
            <GlassButton type="button" variant="accent" onClick={startCreate}>
              Add model
            </GlassButton>
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <GlassSkeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : null}
      {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}
      {!loading && !cars.length && !error ? (
        <GlassCard className="p-8 text-sm text-muted">No car models yet. Add your first model to begin.</GlassCard>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cars.map((car) => (
          <motion.div key={car.id} whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <GlassCard className="overflow-hidden border border-white/10 p-3 transition hover:border-white/20">
              <Image
                src={car.imageUrl}
                alt={car.name}
                width={640}
                height={320}
                className="h-44 w-full rounded-xl object-cover"
              />
              <div className="mt-3 space-y-2 px-1 pb-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-foreground">{car.name}</h3>
                  <GlassBadge>{`#${car.sortOrder}`}</GlassBadge>
                </div>
                <p className="min-h-10 text-sm leading-relaxed text-muted">
                  {car.description || "No description added yet."}
                </p>
                <div className="flex gap-2 pt-1">
                  <GlassButton type="button" variant="secondary" className="!px-3 !py-1.5 !text-xs" onClick={() => startEdit(car)}>
                    Edit
                  </GlassButton>
                  <GlassButton type="button" variant="danger" className="!px-3 !py-1.5 !text-xs" onClick={() => setDeleteId(car.id)}>
                    Remove
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassModal open={open} onClose={() => setOpen(false)} title={editing ? "Edit car model" : "Add car model"}>
        <form onSubmit={onSubmit} className="space-y-3">
          {formError ? <GlassAlert variant="error">{formError}</GlassAlert> : null}
          <div>
            <label className="mb-1.5 block text-sm text-muted">Model Name</label>
            <GlassInput value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-muted">Image URL</label>
            <GlassInput value={form.imageUrl} onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-muted">Description</label>
            <GlassInput value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-muted">Sort Order</label>
            <GlassInput
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))}
            />
          </div>
          {form.imageUrl ? (
            <Image src={form.imageUrl} alt="Preview" width={640} height={260} className="h-40 w-full rounded-xl object-cover" />
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <GlassButton type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="accent">
              {submitLabel}
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Remove car model?"
        message="This soft-deletes the model from the officer dashboard."
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => deleteId && removeCar(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
