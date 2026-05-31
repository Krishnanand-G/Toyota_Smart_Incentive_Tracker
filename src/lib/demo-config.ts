export type DemoCredentials = {
  email: string;
  password: string;
};

export function getDemoCredentials(role: "ADMIN" | "OFFICER"): DemoCredentials | null {
  const showFlag = process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS;

  // Hidden on Vercel/production by default (security). Opt in with =true for class demos.
  if (process.env.NODE_ENV === "production" && showFlag !== "true") {
    return null;
  }

  if (showFlag === "false") {
    return null;
  }

  if (role === "ADMIN") {
    return {
      email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL ?? "admin@toyota.local",
      password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD ?? "admin123",
    };
  }

  return {
    email: process.env.NEXT_PUBLIC_DEMO_OFFICER_EMAIL ?? "officer@toyota.local",
    password: process.env.NEXT_PUBLIC_DEMO_OFFICER_PASSWORD ?? "officer123",
  };
}
