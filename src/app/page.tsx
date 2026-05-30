"use client";

import { GlassCard } from "@/components/glass";
import { motion } from "framer-motion";
import { Shield, UserCircle } from "lucide-react";
import Link from "next/link";

const portals = [
  {
    href: "/login/admin",
    title: "Admin",
    description: "Configure car models, incentive slabs, and manage sales officers.",
    icon: Shield,
    accent: "from-orange-500/20 to-orange-600/5",
  },
  {
    href: "/login/officer",
    title: "Sales Officer",
    description: "Track monthly progress, log individual sales, and view incentive tiers.",
    icon: UserCircle,
    accent: "from-white/10 to-white/[0.02]",
  },
] as const;

export default function HomePage() {
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
        className="w-full max-w-2xl"
      >
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Toyota Smart Incentive Tracker</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Choose your portal
          </h1>
          <p className="mt-2 text-sm text-muted">Select how you want to sign in to continue.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {portals.map((portal, index) => (
            <motion.div
              key={portal.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
            >
              <Link href={portal.href} className="block h-full">
                <GlassCard
                  variant="elevated"
                  className="group flex h-full flex-col gap-4 border border-white/10 p-6 transition hover:border-orange-500/30 hover:bg-white/[0.03]"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${portal.accent} text-orange-400`}
                  >
                    <portal.icon size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground group-hover:text-orange-300 transition">
                      {portal.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{portal.description}</p>
                  </div>
                  <p className="mt-auto text-xs font-medium text-orange-400/90">Continue to sign in →</p>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}
