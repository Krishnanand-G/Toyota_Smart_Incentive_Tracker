import { z } from "zod";

export const carPayloadSchema = z.object({
  name: z.string().min(2).max(80),
  imageUrl: z.string().url(),
  description: z.string().max(300).optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).max(999).default(0),
});

export type CarPayload = z.infer<typeof carPayloadSchema>;
