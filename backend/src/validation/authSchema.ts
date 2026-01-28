import { z } from "zod";

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
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
