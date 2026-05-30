import { requireRole } from "@/lib/auth";
import indiaModels from "@/data/toyota-india-models.json";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

const NHTSA_URL =
  "https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/toyota?format=json";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let cachedModels: string[] | null = null;
let cacheExpiry = 0;

async function fetchAllToyotaModels(): Promise<string[]> {
  if (cachedModels && Date.now() < cacheExpiry) {
    return cachedModels;
  }

  const res = await fetch(NHTSA_URL, { next: { revalidate: 86400 } });
  if (!res.ok) {
    throw new Error("Failed to fetch Toyota models from NHTSA");
  }

  const data = (await res.json()) as {
    Results?: { Model_Name: string }[];
  };

  const nhtsaModels = (data.Results ?? []).map((r) => r.Model_Name);
  const merged = [...new Set([...indiaModels, ...nhtsaModels])].sort((a, b) =>
    a.localeCompare(b),
  );

  cachedModels = merged;
  cacheExpiry = Date.now() + CACHE_TTL_MS;
  return merged;
}

export async function GET(request: Request) {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";

  try {
    const allModels = await fetchAllToyotaModels();
    const filtered = q
      ? allModels.filter((model) => model.toLowerCase().includes(q))
      : allModels;

    return NextResponse.json({ models: filtered.slice(0, 20) });
  } catch {
    const fallback = indiaModels.filter((model) =>
      q ? model.toLowerCase().includes(q) : true,
    );
    return NextResponse.json({ models: fallback.slice(0, 20) });
  }
}
