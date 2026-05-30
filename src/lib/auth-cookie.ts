export const PORTAL_ROLE_COOKIE = "portal-role";

export type PortalRole = "ADMIN" | "OFFICER";

export function isPortalRole(value: string | undefined): value is PortalRole {
  return value === "ADMIN" || value === "OFFICER";
}
