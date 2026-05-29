"use client";

import { GlassAlert, GlassButton } from "@/components/glass";

export default function AdminError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="space-y-3">
      <GlassAlert variant="error">
        <p className="font-medium">Something went wrong in admin area.</p>
        <p className="mt-1 text-xs opacity-90">{error.message}</p>
      </GlassAlert>
      <GlassButton type="button" variant="secondary" onClick={reset}>
        Retry
      </GlassButton>
    </div>
  );
}
