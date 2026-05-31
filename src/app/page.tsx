"use client";

import { GlassCard } from "@/components/glass";
import { motion } from "framer-motion";
import { Shield, UserCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const portals = [
  {
    href: "/login/admin",
    title: "Admin",
    description: "Configure car models, incentive slabs, and manage sales officers.",
    icon: Shield,
  },
  {
    href: "/login/officer",
    title: "Sales Officer",
    description: "Track monthly progress, log individual sales, and view incentive tiers.",
    icon: UserCircle,
  },
] as const;

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background-muted px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <div className="mb-10 text-center">
          <div className="mb-6 flex justify-center">
            <Image
              src="/toyota-wordmark.svg"
              alt="Toyota"
              width={140}
              height={36}
              priority
              className="h-9 w-auto"
            />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Smart Incentive Tracker
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Choose your portal
          </h1>
          <p className="mt-2 text-sm text-muted">Select how you want to sign in to continue.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {portals.map((portal, index) => (
            <motion.div
              key={portal.href}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
            >
              <Link href={portal.href} className="block h-full">
                <GlassCard
                  variant="base"
                  className="group flex h-full flex-col gap-4 p-6 transition hover:border-accent-primary"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-red-50 text-accent-primary">
                    <portal.icon size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground transition group-hover:text-accent-primary">
                      {portal.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{portal.description}</p>
                  </div>
                  <p className="mt-auto text-xs font-medium uppercase tracking-wide text-accent-primary">
                    Continue to sign in →
                  </p>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}
