"use client";

import { GlassCard, GlassInput } from "@/components/glass";
import { FormEvent, useState } from "react";
import { LoaderCircle, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

type LoginStatus = {
  type: "idle" | "error";
  message?: string;
};

export default function LoginPage() {
  const [status, setStatus] = useState<LoginStatus>({ type: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle" });

    try {
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }

      const profileResponse = await fetch("/api/me", { credentials: "include" });
      if (!profileResponse.ok) {
        throw new Error("Unable to load user profile after sign-in.");
      }

      const profile = (await profileResponse.json()) as { role: "ADMIN" | "OFFICER" };
      const destination = profile.role === "ADMIN" ? "/admin" : "/officer";
      window.location.assign(destination);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed. Please try again.";
      setStatus({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="ambient-blob -left-20 top-10 h-72 w-72 bg-violet-300/35" />
        <div className="ambient-blob right-0 top-20 h-80 w-80 bg-sky-200/40" />
        <div className="ambient-blob bottom-0 left-1/4 h-64 w-64 bg-emerald-200/30" />
      </div>

      <GlassCard variant="elevated" className="w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Toyota Incentive Tracker</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to continue to your role dashboard.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <GlassInput id="email" name="email" type="email" required placeholder="you@toyota.com" />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <GlassInput id="password" name="password" type="password" required placeholder="Enter your password" />
          </div>

          {status.type === "error" && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{status.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <LoaderCircle size={18} className="animate-spin" /> : <LogIn size={18} />}
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </GlassCard>
    </main>
  );
}
