"use client";

import { GlassAlert, GlassButton, GlassCard, GlassInput } from "@/components/glass";
import { createClient } from "@/lib/supabase/browser";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

type ExpectedRole = "ADMIN" | "OFFICER";

type RoleLoginFormProps = {
  expectedRole: ExpectedRole;
  title: string;
  subtitle: string;
  redirectPath: string;
  demoEmail: string;
  demoPassword: string;
  roleLabel: string;
};

export function RoleLoginForm({
  expectedRole,
  title,
  subtitle,
  redirectPath,
  demoEmail,
  demoPassword,
  roleLabel,
}: RoleLoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        throw signInError;
      }

      const profileResponse = await fetch("/api/me", { credentials: "include" });
      if (!profileResponse.ok) {
        await supabase.auth.signOut();
        throw new Error("Unable to load user profile after sign-in.");
      }

      const profile = (await profileResponse.json()) as { role: ExpectedRole };
      if (profile.role !== expectedRole) {
        await supabase.auth.signOut();
        throw new Error(`This account is not a ${roleLabel.toLowerCase()}. Use the correct portal to sign in.`);
      }

      window.location.assign(redirectPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
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
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to portal selection
        </Link>

        <GlassCard variant="elevated" className="w-full p-8 sm:p-9">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{roleLabel} sign in</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-muted">
                Email
              </label>
              <GlassInput
                id="email"
                name="email"
                type="email"
                required
                defaultValue={demoEmail}
                placeholder={demoEmail}
              />
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

            {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}

            <GlassButton type="submit" variant="primary" disabled={isSubmitting} className="w-full">
              {isSubmitting ? <LoaderCircle size={18} className="animate-spin" /> : <LogIn size={18} />}
              {isSubmitting ? "Signing in..." : "Sign in"}
            </GlassButton>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-center text-xs text-muted">
              <p className="font-medium text-foreground/80">Demo credentials</p>
              <p className="mt-1 font-mono">
                {demoEmail} / {demoPassword}
              </p>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </main>
  );
}
