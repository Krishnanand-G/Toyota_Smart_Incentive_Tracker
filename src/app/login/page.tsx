"use client";

import { GlassAlert, GlassButton, GlassCard, GlassInput } from "@/components/glass";
import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

type LoginStatus = {
  type: "idle" | "error";
  message?: string;
};

export default function LoginPage() {
  const [status, setStatus] = useState<LoginStatus>({ type: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="ambient-blob -left-20 top-10 h-72 w-72 bg-orange-500/8" />
        <div className="ambient-blob right-0 top-20 h-80 w-80 bg-white/[0.02]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <GlassCard variant="elevated" className="w-full p-8 sm:p-9">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Smart Incentive Calculator</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Built for precision payouts
            </h1>
            <p className="mt-2 text-sm text-muted">
              Sign in to configure incentive slabs or log monthly sales volumes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-muted">
                Email
              </label>
              <GlassInput id="email" name="email" type="email" required placeholder="you@toyota.com" />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm text-muted">
                Password
              </label>
              <div className="relative">
                <GlassInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  className="pr-11"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {status.type === "error" ? <GlassAlert variant="error">{status.message}</GlassAlert> : null}

            <GlassButton type="submit" variant="primary" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <LoaderCircle size={18} className="animate-spin" /> : <LogIn size={18} />}
              {isSubmitting ? "Signing in..." : "Sign in"}
            </GlassButton>

            <p className="text-center text-xs text-muted">
              Demo: admin@toyota.local / officer@toyota.local (Supabase Auth required)
            </p>
          </form>
        </GlassCard>
      </motion.div>
    </main>
  );
}
