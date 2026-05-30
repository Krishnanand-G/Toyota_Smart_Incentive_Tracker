"use client";

import { GlassAlert, GlassButton, GlassCard, GlassInput, GlassModal } from "@/components/glass";
import type { OfficerSummary } from "@/components/admin/officer-list-item";
import { MASKED_PASSWORD } from "@/lib/password";
import Image from "next/image";
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
  password: string;
  newPassword: string;
  confirmPassword: string;
  photoUrl: string;
};

type OfficerDetails = {
  hasPassword: boolean;
  authLinked: boolean;
  authConfigured: boolean;
};

const emptyForm: FormState = {
  fullName: "",
  email: "",
  officerId: "",
  password: "",
  newPassword: "",
  confirmPassword: "",
  photoUrl: "",
};

export function OfficerFormModal({ open, editing, onClose, onSaved }: OfficerFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [details, setDetails] = useState<OfficerDetails | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    setDetails(null);

    if (editing) {
      setForm({
        fullName: editing.fullName ?? "",
        email: editing.email,
        officerId: editing.officerId ?? "",
        password: "",
        newPassword: "",
        confirmPassword: "",
        photoUrl: editing.photoUrl ?? "",
      });

      setLoadingDetails(true);
      fetch(`/api/admin/officers/${editing.id}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("Could not load officer details");
          setDetails((await res.json()) as OfficerDetails);
        })
        .catch(() => setDetails(null))
        .finally(() => setLoadingDetails(false));
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
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not upload photo");
      setForm((prev) => ({ ...prev, photoUrl: data.url }));
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

    if (!editing && form.password.trim().length < 8) {
      setFormError("Password must be at least 8 characters.");
      setSubmitting(false);
      return;
    }

    if (editing && form.newPassword.trim()) {
      if (form.newPassword.trim().length < 8) {
        setFormError("New password must be at least 8 characters.");
        setSubmitting(false);
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setFormError("New password and confirmation do not match.");
        setSubmitting(false);
        return;
      }
    }

    const payload: Record<string, string | null> = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      officerId: form.officerId.trim(),
      photoUrl: form.photoUrl || null,
    };

    if (editing) {
      if (form.newPassword.trim()) {
        payload.newPassword = form.newPassword;
        payload.confirmPassword = form.confirmPassword;
      }
    } else {
      payload.password = form.password;
    }

    const endpoint = editing ? `/api/admin/officers/${editing.id}` : "/api/admin/officers";
    const method = editing ? "PATCH" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const fieldErrors = data?.error?.fieldErrors as Record<string, string[] | undefined> | undefined;
        const firstFieldError = fieldErrors
          ? Object.values(fieldErrors).find((messages) => messages?.[0])?.[0]
          : undefined;
        const message =
          data?.error?.formErrors?.[0] ??
          firstFieldError ??
          (typeof data?.error === "string" ? data.error : null) ??
          "Could not save sales officer";
        throw new Error(message);
      }

      onSaved();
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save sales officer");
    } finally {
      setSubmitting(false);
    }
  }

  const currentPasswordLabel = loadingDetails
    ? "Loading..."
    : details?.hasPassword
      ? MASKED_PASSWORD
      : "Not set";

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

          {editing ? (
            <>
              <div>
                <label className="mb-1.5 block text-sm text-muted">Current password</label>
                <GlassInput
                  type="text"
                  value={currentPasswordLabel}
                  readOnly
                  className="cursor-default text-muted"
                />
                <p className="mt-1 text-xs text-muted">
                  {details?.hasPassword
                    ? "Password is saved in the database and Supabase Auth. Enter a new password below to change it."
                    : "No password on file yet. Set one below to enable login."}
                  {!details?.authConfigured ? " Add SUPABASE_SERVICE_ROLE_KEY to sync login credentials." : null}
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-muted">New password</label>
                <GlassInput
                  type="text"
                  value={form.newPassword}
                  onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-muted">Confirm new password</label>
                <GlassInput
                  type="text"
                  value={form.confirmPassword}
                  onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Re-enter new password"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm text-muted">Password</label>
              <GlassInput
                type="text"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
              />
            </div>
          )}

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
              {form.photoUrl ? (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, photoUrl: "" }))}
                  className="text-xs text-muted transition hover:text-foreground"
                >
                  Remove photo
                </button>
              ) : null}
            </div>
            {form.photoUrl ? (
              <div className="relative mt-3 h-24 w-24 overflow-hidden rounded-xl border border-white/10">
                <Image src={form.photoUrl} alt="Officer preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, photoUrl: "" }))}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                  aria-label="Remove photo"
                >
                  <X size={12} />
                </button>
              </div>
            ) : null}
          </div>

          {!editing ? (
            <GlassCard className="border border-white/10 bg-white/[0.02] p-3">
              <p className="text-xs leading-relaxed text-muted">
                Creates the profile in PostgreSQL and login credentials in Supabase Auth. Requires
                SUPABASE_SERVICE_ROLE_KEY in your environment.
              </p>
            </GlassCard>
          ) : null}
        </div>

        <div className="mt-4 flex shrink-0 justify-end gap-2 border-t border-white/10 bg-[var(--glass-elevated)] pt-4">
          <GlassButton type="button" variant="ghost" onClick={onClose}>
            Cancel
          </GlassButton>
          <GlassButton type="submit" variant="accent" disabled={submitting || uploading || loadingDetails}>
            {submitting ? "Saving..." : editing ? "Save changes" : "Add sales officer"}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  );
}
