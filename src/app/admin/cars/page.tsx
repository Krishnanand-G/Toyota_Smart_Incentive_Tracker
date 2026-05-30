"use client";

import { SearchableCombobox, ToyotaModelCombobox } from "@/components/admin";
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
import { composeCarDisplayName } from "@/lib/car-model-utils";
import type { CarwaleTrimOptions } from "@/lib/carwale-variants";
import { motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type CarModel = {
  id: string;
  name: string;
  modelName: string;
  baseSuffix: string | null;
  variant: string | null;
  imageUrl: string;
  description: string | null;
};

const emptyForm = {
  modelName: "",
  baseSuffix: "",
  variant: "",
  imageUrl: "",
  description: "",
};

export default function AdminCarsPage() {
  const [cars, setCars] = useState<CarModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CarModel | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const hasLoaded = useRef(false);
  const skipCarwaleAutofill = useRef(false);
  const descriptionTouched = useRef(false);
  const [fetchingCarwale, setFetchingCarwale] = useState(false);
  const [carwaleSource, setCarwaleSource] = useState<{ image?: boolean; description?: boolean } | null>(
    null,
  );
  const [trimOptions, setTrimOptions] = useState<CarwaleTrimOptions | null>(null);

  const loadCars = useCallback(async (q?: string) => {
    if (!hasLoaded.current) setLoading(true);
    setError(null);
    try {
      const params = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
      const res = await fetch(`/api/admin/cars${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load cars");
      const data = (await res.json()) as CarModel[];
      setCars(data);
      hasLoaded.current = true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load cars");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCars(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, loadCars]);

  const displayPreview = useMemo(
    () => composeCarDisplayName(form.modelName, form.baseSuffix, form.variant),
    [form.modelName, form.baseSuffix, form.variant],
  );

  const submitLabel = useMemo(() => (editing ? "Save changes" : "Add car model"), [editing]);

  const baseSuffixOptions = useMemo(() => {
    if (!trimOptions) return form.baseSuffix ? [form.baseSuffix] : [];
    const options = [...trimOptions.baseSuffixes];
    if (form.baseSuffix && !options.includes(form.baseSuffix)) {
      options.unshift(form.baseSuffix);
    }
    return options;
  }, [trimOptions, form.baseSuffix]);

  const variantOptions = useMemo(() => {
    if (!trimOptions) return form.variant ? [form.variant] : [];
    const baseKey = form.baseSuffix.trim() || "Standard";
    const options = [...(trimOptions.variantsByBase[baseKey] ?? [])];
    if (form.variant && !options.includes(form.variant)) {
      options.unshift(form.variant);
    }
    return options;
  }, [trimOptions, form.baseSuffix, form.variant]);

  const baseSuffixValue =
    form.baseSuffix.trim() ||
    (trimOptions?.baseSuffixes.includes("Standard") ? "Standard" : form.baseSuffix);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    skipCarwaleAutofill.current = false;
    descriptionTouched.current = false;
    setCarwaleSource(null);
    setTrimOptions(null);
    setOpen(true);
  }

  function startEdit(car: CarModel) {
    setEditing(car);
    setForm({
      modelName: car.modelName,
      baseSuffix: car.baseSuffix ?? "",
      variant: car.variant ?? "",
      imageUrl: car.imageUrl,
      description: car.description ?? "",
    });
    setFormError(null);
    skipCarwaleAutofill.current = true;
    descriptionTouched.current = true;
    setCarwaleSource(car.imageUrl.includes("aeplcdn.com") ? { image: true } : null);
    setTrimOptions(null);
    setOpen(true);
    void loadCarwaleData(car.modelName, { autofill: false });
  }

  async function loadCarwaleData(modelName: string, options?: { autofill?: boolean }) {
    if (!modelName.trim()) return;
    const autofill = options?.autofill ?? true;
    setFetchingCarwale(true);
    try {
      const res = await fetch(`/api/admin/carwale-image?model=${encodeURIComponent(modelName.trim())}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;

      if (Array.isArray(data.baseSuffixes) && data.variantsByBase) {
        setTrimOptions({
          baseSuffixes: data.baseSuffixes,
          variantsByBase: data.variantsByBase,
          trims: Array.isArray(data.trims) ? data.trims : [],
        });
      }

      if (!autofill) return;

      const nextSource: { image?: boolean; description?: boolean } = {};
      setForm((prev) => {
        const next = { ...prev };
        if (typeof data.imageUrl === "string") {
          next.imageUrl = data.imageUrl;
          nextSource.image = true;
        }
        if (!descriptionTouched.current && typeof data.description === "string") {
          next.description = data.description;
          nextSource.description = true;
        }
        return next;
      });
      if (nextSource.image || nextSource.description) {
        setCarwaleSource((prev) => ({ ...prev, ...nextSource }));
      }
    } finally {
      setFetchingCarwale(false);
    }
  }

  useEffect(() => {
    if (!open || skipCarwaleAutofill.current) {
      skipCarwaleAutofill.current = false;
      return;
    }

    const modelName = form.modelName.trim();
    if (!modelName) return;

    const timer = setTimeout(() => {
      void loadCarwaleData(modelName);
    }, 400);

    return () => clearTimeout(timer);
  }, [form.modelName, open]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    const payload = { ...form };

    const endpoint = editing ? `/api/admin/cars/${editing.id}` : "/api/admin/cars";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const fieldErrors = data?.error?.fieldErrors as Record<string, string[] | undefined> | undefined;
      const firstFieldError = fieldErrors
        ? Object.values(fieldErrors).find((messages) => messages?.[0])?.[0]
        : undefined;
      setFormError(
        data?.error?.formErrors?.[0] ?? firstFieldError ?? "Could not save car",
      );
      return;
    }

    setOpen(false);
    await loadCars(searchQuery);
  }

  async function removeCar(id: string) {
    const res = await fetch(`/api/admin/cars/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Could not delete car model");
      return;
    }
    setDeleteId(null);
    await loadCars(searchQuery);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Inventory"
        description="Maintain showroom lineup for sales officer submissions."
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

      <GlassInput
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search by model name, variant, or display name..."
      />

      {loading && !cars.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <GlassSkeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : null}
      {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}
      {!loading && !cars.length && !error ? (
        <GlassCard className="p-8 text-sm text-muted">
          {searchQuery ? "No models match your search." : "No car models yet. Add your first model to begin."}
        </GlassCard>
      ) : null}

      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cars.map((car) => (
          <motion.div
            key={car.id}
            className="h-full"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <GlassCard
              role="button"
              tabIndex={0}
              onClick={() => startEdit(car)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  startEdit(car);
                }
              }}
              className="flex h-full cursor-pointer flex-col overflow-hidden border border-white/10 p-3 transition hover:border-white/20"
            >
              <Image
                key={car.imageUrl}
                src={car.imageUrl}
                alt={car.name}
                width={664}
                height={374}
                unoptimized
                className="h-44 w-full shrink-0 rounded-xl object-cover"
              />
              <div className="mt-3 flex flex-1 flex-col gap-2 px-1 pb-1">
                <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-foreground">
                  {car.name}
                </h3>
                <div className="flex min-h-[3.25rem] flex-wrap content-start gap-1.5">
                  <GlassBadge>{car.modelName}</GlassBadge>
                  {car.baseSuffix ? <GlassBadge>{car.baseSuffix}</GlassBadge> : null}
                  {car.variant ? <GlassBadge>{car.variant}</GlassBadge> : null}
                </div>
                <p className="line-clamp-4 min-h-[5rem] flex-1 text-sm leading-relaxed text-muted">
                  {car.description || "No description added yet."}
                </p>
                <div className="mt-auto flex gap-2 pt-2">
                  <GlassButton
                    type="button"
                    variant="danger"
                    className="!px-3 !py-1.5 !text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(car.id);
                    }}
                  >
                    Remove
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassModal open={open} onClose={() => setOpen(false)} title={editing ? "Edit car model" : "Add car model"}>
        <form onSubmit={onSubmit} className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto]">
          <div className="min-h-0 space-y-3 overflow-y-auto overscroll-contain pr-1">
            {formError ? <GlassAlert variant="error">{formError}</GlassAlert> : null}

            <div>
              <label className="mb-1.5 block text-sm text-muted">Toyota model</label>
              <ToyotaModelCombobox
                value={form.modelName}
                onChange={(modelName) => {
                  setTrimOptions(null);
                  setForm((prev) => ({ ...prev, modelName, baseSuffix: "", variant: "" }));
                }}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted">Base suffix</label>
              <SearchableCombobox
                value={baseSuffixValue}
                onChange={(value) => {
                  const baseSuffix = value === "Standard" ? "" : value;
                  setForm((prev) => ({ ...prev, baseSuffix, variant: "" }));
                }}
                options={baseSuffixOptions}
                loading={fetchingCarwale}
                disabled={!form.modelName.trim()}
                placeholder={form.modelName.trim() ? "Search trims..." : "Pick a model first"}
                emptyMessage="No trims found — type your own"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted">Variant</label>
              <SearchableCombobox
                value={form.variant}
                onChange={(variant) => setForm((prev) => ({ ...prev, variant }))}
                options={variantOptions}
                loading={fetchingCarwale}
                disabled={!form.modelName.trim()}
                placeholder={form.modelName.trim() ? "Search variants..." : "Pick a model first"}
                emptyMessage="No variants found — type your own"
              />
            </div>

            {displayPreview ? (
              <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                <p className="text-xs text-muted">Display name preview</p>
                <p className="text-sm font-medium text-foreground">{displayPreview}</p>
              </div>
            ) : null}

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="block text-sm text-muted">Image</label>
                <GlassButton
                  type="button"
                  variant="ghost"
                  className="!px-2 !py-1 !text-xs"
                  disabled={!form.modelName.trim() || fetchingCarwale}
                  onClick={() => loadCarwaleData(form.modelName)}
                >
                  {fetchingCarwale ? "Fetching..." : "Refresh from CarWale"}
                </GlassButton>
              </div>
              <GlassInput
                value={form.imageUrl}
                onChange={(e) => {
                  setCarwaleSource((prev) => (prev?.image ? { ...prev, image: false } : prev));
                  setForm((prev) => ({ ...prev, imageUrl: e.target.value }));
                }}
                placeholder="Auto-filled from CarWale when you pick a model"
                required
              />
              {carwaleSource?.image ? (
                <p className="mt-1 text-xs text-orange-400/90">Image sourced from CarWale</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted">Description</label>
              <GlassInput
                value={form.description}
                onChange={(e) => {
                  descriptionTouched.current = true;
                  setCarwaleSource((prev) => (prev?.description ? { ...prev, description: false } : prev));
                  setForm((prev) => ({ ...prev, description: e.target.value }));
                }}
                placeholder="Auto-filled from CarWale when you pick a model"
              />
              {carwaleSource?.description ? (
                <p className="mt-1 text-xs text-orange-400/90">Description sourced from CarWale</p>
              ) : descriptionTouched.current && form.description ? (
                <p className="mt-1 text-xs text-muted">Custom description — won&apos;t be overwritten</p>
              ) : null}
            </div>
            {form.imageUrl ? (
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                <div className="relative aspect-[664/374] w-full">
                  <Image
                    src={form.imageUrl}
                    alt="Preview"
                    fill
                    unoptimized
                    sizes="(max-width: 512px) 100vw, 512px"
                    className="object-contain p-2"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex shrink-0 justify-end gap-2 border-t border-white/10 bg-[var(--glass-elevated)] pt-4 pb-1">
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
        message="This soft-deletes the model from the sales officer dashboard."
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => deleteId && removeCar(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
