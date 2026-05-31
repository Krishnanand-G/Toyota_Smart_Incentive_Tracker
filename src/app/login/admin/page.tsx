import { RoleLoginForm } from "@/components/auth/role-login-form";
import { getDemoCredentials } from "@/lib/demo-config";

export default function AdminLoginPage() {
  const demo = getDemoCredentials("ADMIN");

  return (
    <RoleLoginForm
      expectedRole="ADMIN"
      roleLabel="Admin"
      title="Admin portal"
      subtitle="Sign in to manage cars, incentive tiers, and sales officers."
      redirectPath="/admin"
      demoEmail={demo?.email}
      demoPassword={demo?.password}
    />
  );
}
