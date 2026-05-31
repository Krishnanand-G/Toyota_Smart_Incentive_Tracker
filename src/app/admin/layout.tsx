import { PortalLayout } from "@/components/layout/portal-layout";
import { adminNavItems } from "@/components/layout/nav-config";
import { getAuthProfile } from "@/lib/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getAuthProfile();
  if (!profile || profile.role !== Role.ADMIN) {
    redirect("/");
  }

  return (
    <PortalLayout portalLabel="Admin Portal" navItems={adminNavItems}>
      {children}
    </PortalLayout>
  );
}
