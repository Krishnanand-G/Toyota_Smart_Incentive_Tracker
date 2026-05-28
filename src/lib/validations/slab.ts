import { z } from "zod";

export const slabRowSchema = z
  .object({
    id: z.string().optional(),
    minUnits: z.number().int().min(0),
    maxUnits: z.number().int().min(0).nullable(),
    perUnitAmount: z.number().min(0),
    label: z.string().max(80).nullable().optional(),
  })
  .refine((row) => row.maxUnits === null || row.maxUnits >= row.minUnits, {
    message: "maxUnits must be greater than or equal to minUnits",
    path: ["maxUnits"],
  });

export const slabBatchSchema = z
  .array(slabRowSchema)
  .min(1)
  .refine(
    (rows) => {
      const sorted = [...rows].sort((a, b) => a.minUnits - b.minUnits);
      for (let i = 0; i < sorted.length - 1; i += 1) {
        const current = sorted[i];
        const next = sorted[i + 1];
        if (current.maxUnits !== null && current.maxUnits >= next.minUnits) {
          return false;
        }
      }
      return true;
    },
    { message: "Slab ranges must not overlap" },
  );

export type SlabRowInput = z.infer<typeof slabRowSchema>;
