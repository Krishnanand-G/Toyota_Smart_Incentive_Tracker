import { RoleLoginForm } from "@/components/auth/role-login-form";

export default function AdminLoginPage() {
  return (
    <RoleLoginForm
      expectedRole="ADMIN"
      roleLabel="Admin"
      title="Admin portal"
      subtitle="Sign in to manage cars, incentive tiers, and sales officers."
      redirectPath="/admin"
      demoEmail="admin@toyota.local"
      demoPassword="admin123"
    />
  );
}
