import { z } from "zod";

const genderPreferenceEnum = z.enum(["male", "female", "non-binary", "everyone"]);

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  dateOfBirth: z.string(),
  gender: z.enum(["male", "female", "non-binary", "other"]).optional(),
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\+?\d{10,15}$/.test(value), {
      message: "Invalid phone number",
    }),
  graduationYear: z.number().int().min(2020).max(2040).optional().nullable(),
  datingPreferences: z.object({
    preference: genderPreferenceEnum.nullable().optional(),
    notLooking: z.boolean().optional(),
  }).optional().nullable(),
  friendsPreferences: z.object({
    preference: genderPreferenceEnum.optional(),
  }).optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
