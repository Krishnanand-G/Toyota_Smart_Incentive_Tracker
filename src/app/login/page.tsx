"use client";

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
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-[20px] border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Toyota Incentive Tracker</h1>
        <p className="mt-2 text-sm text-slate-300/80">Sign in to continue to your role dashboard.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-slate-200">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-slate-100 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              placeholder="you@toyota.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-slate-200">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-slate-100 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          {status.type === "error" && (
            <p className="rounded-lg border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm text-red-200">{status.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <LoaderCircle size={18} className="animate-spin" /> : <LogIn size={18} />}
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}
