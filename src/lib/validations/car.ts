import { z } from "zod";

export const carPayloadSchema = z.object({
  modelName: z.string().min(2).max(60),
  baseSuffix: z.string().max(30).optional().or(z.literal("")),
  variant: z.string().max(80).optional().or(z.literal("")),
  imageUrl: z.string().url(),
  description: z.string().max(1000).optional().or(z.literal("")),
});

export type CarPayload = z.infer<typeof carPayloadSchema>;
