"use client";

import { GlassAlert, GlassButton } from "@/components/glass";

export default function OfficerError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="space-y-3">
      <GlassAlert variant="error">
        <p className="font-medium">Something went wrong in the sales officer area.</p>
        <p className="mt-1 text-xs opacity-90">{error.message}</p>
      </GlassAlert>
      <GlassButton type="button" variant="secondary" onClick={reset}>
        Retry
      </GlassButton>
    </div>
  );
}
