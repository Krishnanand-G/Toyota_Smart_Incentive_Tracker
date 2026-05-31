import { PortalLayout } from "@/components/layout/portal-layout";
import { officerNavItems } from "@/components/layout/nav-config";
import { OfficerWelcomeBanner } from "@/components/officer/officer-welcome-banner";
import { getAuthProfile } from "@/lib/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function OfficerLayout({ children }: { children: React.ReactNode }) {
  const profile = await getAuthProfile();
  if (!profile || profile.role !== Role.OFFICER) {
    redirect("/");
  }

  return (
    <PortalLayout
      portalLabel="Sales Officer Portal"
      navItems={officerNavItems}
      mobileShell="officer"
    >
      <OfficerWelcomeBanner
        fullName={profile.fullName}
        email={profile.email}
        photoUrl={profile.photoUrl}
        officerId={profile.officerId}
      />
      {children}
    </PortalLayout>
  );
}
