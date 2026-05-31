"use client";

import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { useState } from "react";

type SignOutButtonProps = {
  className?: string;
  compact?: boolean;
};

export function SignOutButton({ className, compact = false }: SignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await fetch("/api/me", { method: "DELETE" });
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted transition hover:border-accent-primary hover:text-accent-primary disabled:opacity-60",
        className,
      )}
    >
      <LogOut size={14} />
      {!compact && (isSigningOut ? "Signing out..." : "Sign out")}
    </button>
  );
}
