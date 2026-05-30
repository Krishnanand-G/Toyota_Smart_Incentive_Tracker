import { fetchCarwaleDataForModel, modelNameToCarwaleSlug } from "@/lib/carwale-image";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireRole(Role.ADMIN);
  if (auth.error) return auth.error;

  const url = new URL(request.url);
  const model = url.searchParams.get("model")?.trim() ?? "";

  if (!model) {
    return NextResponse.json({ error: "model query is required" }, { status: 400 });
  }

  const slug = modelNameToCarwaleSlug(model);
  if (!slug) {
    return NextResponse.json({ error: "Could not resolve CarWale model slug." }, { status: 400 });
  }

  try {
    const data = await fetchCarwaleDataForModel(model);
    if (!data?.imageUrl && !data?.description) {
      return NextResponse.json(
        { error: "No CarWale data found for this model.", slug },
        { status: 404 },
      );
    }

    return NextResponse.json({
      model,
      slug,
      imageUrl: data.imageUrl,
      description: data.description,
      source: "carwale",
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch data from CarWale." }, { status: 502 });
  }
}
