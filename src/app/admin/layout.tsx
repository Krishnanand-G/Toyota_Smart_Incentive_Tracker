import { PortalLayout } from "@/components/layout/portal-layout";
import { adminNavItems } from "@/components/layout/nav-config";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalLayout portalLabel="Admin Portal" navItems={adminNavItems}>
      {children}
    </PortalLayout>
  );
}
