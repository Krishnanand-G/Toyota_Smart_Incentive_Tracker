import { z } from "zod";

const officerIdSchema = z
  .string()
  .trim()
  .min(2)
  .max(24)
  .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only");

const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);

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
  password: passwordSchema,
  photoUrl: photoUrlSchema,
});

export const updateOfficerSchema = z
  .object({
    email: z.string().email().optional(),
    fullName: z.string().trim().min(2).max(80).optional(),
    officerId: officerIdSchema.optional(),
    newPassword: passwordSchema.optional(),
    confirmPassword: z.string().optional(),
    photoUrl: photoUrlSchema,
  })
  .superRefine((data, ctx) => {
    const hasNew = Boolean(data.newPassword?.trim());
    const hasConfirm = Boolean(data.confirmPassword?.trim());

    if (hasNew && !hasConfirm) {
      ctx.addIssue({
        code: "custom",
        message: "Confirm the new password.",
        path: ["confirmPassword"],
      });
    }

    if (hasNew && data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "New password and confirmation do not match.",
        path: ["confirmPassword"],
      });
    }
  });
