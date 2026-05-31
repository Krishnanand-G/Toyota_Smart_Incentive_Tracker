import { NextResponse } from "next/server";
import type { ZodError } from "zod";

type ApiErrorBody = { error: string | ReturnType<ZodError["flatten"]> };

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message } satisfies ApiErrorBody, { status });
}

export function zodValidationResponse(error: ZodError) {
  return NextResponse.json({ error: error.flatten() } satisfies ApiErrorBody, { status: 400 });
}

export function firstZodFieldMessage(error: ZodError, preferredFields: string[] = []) {
  const { fieldErrors, formErrors } = error.flatten();
  const fields = fieldErrors as Record<string, string[] | undefined>;
  for (const field of preferredFields) {
    const message = fields[field]?.[0];
    if (message) return message;
  }
  const firstFieldError = Object.values(fields).find((messages) => messages?.[0])?.[0];
  return firstFieldError ?? formErrors[0] ?? "Invalid request";
}

export function routeErrorFromThrown(error: unknown, knownErrors: Record<string, number> = {}) {
  const message = error instanceof Error ? error.message : "Something went wrong";
  const status = knownErrors[message] ?? 500;
  return jsonError(message, status);
}

export function getApiErrorMessage(
  data: { error?: unknown } | null | undefined,
  fallback = "Something went wrong",
) {
  const error = data?.error;
  if (typeof error === "string" && error.trim()) return error;

  if (error && typeof error === "object") {
    const structured = error as {
      formErrors?: string[];
      fieldErrors?: Record<string, string[] | undefined>;
    };
    const firstFieldError = structured.fieldErrors
      ? Object.values(structured.fieldErrors).find((messages) => messages?.[0])?.[0]
      : undefined;
    if (structured.formErrors?.[0]) return structured.formErrors[0];
    if (firstFieldError) return firstFieldError;
  }

  return fallback;
}

export async function readJsonOrEmpty<T extends { error?: unknown } = { error?: unknown }>(
  response: Response,
): Promise<T> {
  return response.json().catch(() => ({}) as T);
}
