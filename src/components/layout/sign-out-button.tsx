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
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={cn(
        "glass-pill inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground disabled:opacity-60",
        className,
      )}
    >
      <LogOut size={16} />
      {!compact && (isSigningOut ? "Signing out..." : "Sign out")}
    </button>
  );
}
