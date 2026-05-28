"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-700">Something went wrong in admin area.</p>
      <p className="mt-1 text-xs text-red-600">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-3 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
      >
        Retry
      </button>
    </div>
  );
}
