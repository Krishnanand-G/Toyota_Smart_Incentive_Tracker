"use client";

import { GlassAlert, GlassButton } from "@/components/glass";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background-muted p-6">
      <div className="w-full max-w-md space-y-4">
        <GlassAlert variant="error">
          <p className="font-medium">Something went wrong.</p>
          <p className="mt-1 text-xs opacity-90">{error.message}</p>
        </GlassAlert>
        <GlassButton type="button" variant="secondary" onClick={reset}>
          Try again
        </GlassButton>
      </div>
    </div>
  );
}
