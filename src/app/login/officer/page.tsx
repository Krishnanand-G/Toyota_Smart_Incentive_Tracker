import { RoleLoginForm } from "@/components/auth/role-login-form";

export default function OfficerLoginPage() {
  return (
    <RoleLoginForm
      expectedRole="OFFICER"
      roleLabel="Sales Officer"
      title="Sales Officer Portal"
      subtitle="Sign in to log sales and track your monthly incentive progress."
      redirectPath="/officer"
      demoEmail="officer@toyota.local"
      demoPassword="officer123"
    />
  );
}
