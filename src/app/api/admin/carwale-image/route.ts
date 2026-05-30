import { fetchCarwaleDataForModel, modelNameToCarwaleSlug } from "@/lib/carwale-image";
import { buildTrimOptions, mergeTrimOptions } from "@/lib/carwale-variants";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
    const existingCars = await prisma.carModel.findMany({
      where: { modelName: { equals: model, mode: "insensitive" }, isActive: true },
      select: { baseSuffix: true, variant: true },
    });

    const trimOptions = mergeTrimOptions(
      data?.trimOptions ?? buildTrimOptions([]),
      existingCars,
    );

    return NextResponse.json({
      model,
      slug,
      imageUrl: data?.imageUrl ?? null,
      description: data?.description ?? null,
      ...trimOptions,
      source: "carwale",
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch data from CarWale." }, { status: 502 });
  }
}
