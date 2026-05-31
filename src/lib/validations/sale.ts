import { z } from "zod";

export const monthKeySchema = z.string().regex(/^\d{4}-\d{2}$/, "month must be YYYY-MM");

export const saleItemSchema = z.object({
  carModelId: z.string().min(1),
  units: z.number().int().min(0).max(999),
});

export const upsertSaleSchema = z
  .object({
    monthKey: monthKeySchema,
    items: z.array(saleItemSchema),
  })
  .refine(
    (data) => new Set(data.items.map((item) => item.carModelId)).size === data.items.length,
    { message: "Each car model can only appear once", path: ["items"] },
  );

export const submitSaleSchema = z.object({
  monthKey: monthKeySchema,
});
