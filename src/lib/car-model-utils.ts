export function composeCarDisplayName(
  modelName: string,
  baseSuffix?: string | null,
  variant?: string | null,
): string {
  return [modelName.trim(), baseSuffix?.trim(), variant?.trim()].filter(Boolean).join(" ");
}
