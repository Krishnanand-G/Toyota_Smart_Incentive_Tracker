import { z } from "zod";

const officerIdSchema = z
  .string()
  .trim()
  .min(2)
  .max(24)
  .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only");

const photoUrlSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z
    .union([
      z.string().url(),
      z.string().regex(/^\/[^\s]+$/, "Invalid uploaded photo path"),
    ])
    .nullable()
    .optional(),
);

export const createOfficerSchema = z.object({
  email: z.string().email(),
  fullName: z.string().trim().min(2).max(80),
  officerId: officerIdSchema,
  photoUrl: photoUrlSchema,
});

export const updateOfficerSchema = z.object({
  email: z.string().email().optional(),
  fullName: z.string().trim().min(2).max(80).optional(),
  officerId: officerIdSchema.optional(),
  photoUrl: photoUrlSchema,
});
