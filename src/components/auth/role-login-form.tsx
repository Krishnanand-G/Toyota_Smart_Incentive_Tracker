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
  demoEmail?: string;
  demoPassword?: string;
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
    <main className="relative flex min-h-screen items-center justify-center bg-background-muted px-4 py-6 max-lg:py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-accent-primary"
        >
          <ArrowLeft size={16} />
          Back to portal selection
        </Link>

        <GlassCard variant="elevated" className="w-full p-6 sm:p-9 max-lg:p-7">
          <div className="mb-8">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">{roleLabel} sign in</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted">
                Email
              </label>
              <GlassInput
                id="email"
                name="email"
                type="email"
                required
                defaultValue={demoEmail}
                placeholder={demoEmail ?? "you@example.com"}
                className="min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted">
                Password
              </label>
              <div className="relative">
                <GlassInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  className="min-h-[44px] pr-11"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted transition hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error ? <GlassAlert variant="error">{error}</GlassAlert> : null}

            <GlassButton
              type="submit"
              variant="accent"
              disabled={isSubmitting}
              className="officer-touch w-full !min-h-[48px]"
            >
              {isSubmitting ? <LoaderCircle size={18} className="animate-spin" /> : <LogIn size={18} />}
              {isSubmitting ? "Signing in..." : "Sign in"}
            </GlassButton>

            {demoEmail && demoPassword ? (
              <div className="rounded-md border border-border bg-surface-row px-3 py-2.5 text-center text-xs text-muted">
                <p className="font-medium text-foreground">Demo credentials</p>
                <p className="mt-1 break-all text-center font-mono">
                  {demoEmail} / {demoPassword}
                </p>
              </div>
            ) : null}
          </form>
        </GlassCard>
      </motion.div>
    </main>
  );
}
