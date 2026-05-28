import { PortalLayout } from "@/components/layout/portal-layout";
import { officerNavItems } from "@/components/layout/nav-config";

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalLayout portalLabel="Officer Portal" navItems={officerNavItems}>
      {children}
    </PortalLayout>
  );
}
