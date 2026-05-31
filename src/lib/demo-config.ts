export type DemoCredentials = {
  email: string;
  password: string;
};

export function getDemoCredentials(role: "ADMIN" | "OFFICER"): DemoCredentials | null {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  if (process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS === "false") {
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
