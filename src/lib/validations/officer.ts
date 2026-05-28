import { z } from "zod";

export const createOfficerSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(80),
});
