"use client";

import { OfficerAvatar } from "@/components/admin/officer-avatar";
import { GlassAlert, GlassButton, GlassInput, GlassModal } from "@/components/glass";
import type { OfficerSummary } from "@/lib/admin-types";
import { getApiErrorMessage, readJsonOrEmpty } from "@/lib/api-errors";
import { resolveOfficerPhotoUrl } from "@/lib/officer-photo";
import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";

type OfficerFormModalProps = {
  open: boolean;
  editing: OfficerSummary | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  fullName: string;
  email: string;
  officerId: string;
  photoUrl: string;
};

const emptyForm: FormState = {
  fullName: "",
  email: "",
  officerId: "",
  photoUrl: "",
};

export function OfficerFormModal({ open, editing, onClose, onSaved }: OfficerFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setFormError(null);

    if (editing) {
      setForm({
        fullName: editing.fullName ?? "",
        email: editing.email,
        officerId: editing.officerId ?? "",
        photoUrl: resolveOfficerPhotoUrl(editing.photoUrl) ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, editing]);

  async function uploadPhoto(file: File) {
    setUploading(true);
    setFormError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/officers/photo", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: unknown };
      if (!res.ok) throw new Error(getApiErrorMessage(data, "Could not upload photo"));
      setForm((prev) => ({ ...prev, photoUrl: data.url ?? "" }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not upload photo");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const payload: Record<string, string | null> = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      officerId: form.officerId.trim(),
      photoUrl: form.photoUrl || null,
    };

    const endpoint = editing ? `/api/admin/officers/${editing.id}` : "/api/admin/officers";
    const method = editing ? "PATCH" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await readJsonOrEmpty(res);

      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, "Could not save sales officer"));
      }

      onSaved();
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save sales officer");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassModal
      open={open}
      onClose={onClose}
      title={editing ? "Edit sales officer" : "Add sales officer"}
    >
      <form onSubmit={handleSubmit} className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto]">
        <div className="min-h-0 space-y-3 overflow-y-auto overscroll-contain pr-1">
          {formError ? <GlassAlert variant="error">{formError}</GlassAlert> : null}

          <div>
            <label className="mb-1.5 block text-sm text-muted">Full name</label>
            <GlassInput
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-muted">Sales officer ID</label>
            <GlassInput
              value={form.officerId}
              onChange={(e) => setForm((prev) => ({ ...prev, officerId: e.target.value.toUpperCase() }))}
              placeholder="e.g. SO-001"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-muted">Email</label>
            <GlassInput
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-muted">Profile photo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadPhoto(file);
                e.target.value = "";
              }}
            />
            <div className="flex items-center gap-3">
              <GlassButton
                type="button"
                variant="secondary"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} />
                {uploading ? "Uploading..." : "Upload photo"}
              </GlassButton>
              {resolveOfficerPhotoUrl(form.photoUrl) ? (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, photoUrl: "" }))}
                  className="text-xs text-muted transition hover:text-foreground"
                >
                  Remove photo
                </button>
              ) : null}
            </div>
            <div className="relative mt-3 inline-block">
              <OfficerAvatar
                fullName={form.fullName || editing?.fullName || null}
                email={form.email || editing?.email || "officer@toyota.local"}
                photoUrl={form.photoUrl}
                size="lg"
              />
              {resolveOfficerPhotoUrl(form.photoUrl) ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setForm((prev) => ({ ...prev, photoUrl: "" }));
                  }}
                  className="absolute -right-1 -top-1 rounded-full border border-border bg-surface-elevated p-1 text-muted transition hover:text-foreground"
                  aria-label="Remove photo"
                >
                  <X size={12} />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-surface-elevated pt-4 lg:flex-row lg:justify-end">
          <GlassButton type="button" variant="ghost" className="w-full lg:w-auto" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            variant="accent"
            className="w-full lg:w-auto"
            disabled={submitting || uploading}
          >
            {submitting ? "Saving..." : editing ? "Save changes" : "Add sales officer"}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}
