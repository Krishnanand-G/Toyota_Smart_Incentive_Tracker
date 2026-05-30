import { z } from "zod";

export const createSaleEntrySchema = z.object({
  carModelId: z.string().min(1),
  soldAt: z.union([z.string().min(1), z.coerce.date()]),
  monthKey: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

export type CreateSaleEntryInput = z.infer<typeof createSaleEntrySchema>;
