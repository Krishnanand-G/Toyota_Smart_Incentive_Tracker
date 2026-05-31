import { RoleLoginForm } from "@/components/auth/role-login-form";
import { getDemoCredentials } from "@/lib/demo-config";

export default function OfficerLoginPage() {
  const demo = getDemoCredentials("OFFICER");

  return (
    <RoleLoginForm
      expectedRole="OFFICER"
      roleLabel="Sales Officer"
      title="Sales Officer Portal"
      subtitle="Sign in to log sales and track your monthly incentive progress."
      redirectPath="/officer"
      demoEmail={demo?.email}
      demoPassword={demo?.password}
    />
  );
}
