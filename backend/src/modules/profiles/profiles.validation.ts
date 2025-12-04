// src/modules/profiles/profiles.validation.ts
import { z } from "zod";

export const genderPreferenceEnum = z.enum([
  "male",
  "female",
  "non-binary",
  "everyone",
]);

export const profileUpdateSchema = z
  .object({
    displayName: z.string().trim().min(1).max(255).optional(),
    bio: z.string().trim().max(2000).optional(),
    major: z.string().trim().max(255).optional(),
    graduationYear: z.number().int().min(2020).max(2040).optional(),

    isDatingEnabled: z.boolean().optional(),
    isFriendsEnabled: z.boolean().optional(),

    datingGenderPreference: genderPreferenceEnum.optional(),
    friendsGenderPreference: genderPreferenceEnum.optional(),

    minAgePreference: z.number().int().min(18).max(100).optional(),
    maxAgePreference: z.number().int().min(18).max(100).optional(),

    maxDistanceKm: z.number().int().min(1).max(500).optional(),

    showMeInDiscovery: z.boolean().optional(),

    locationDescription: z.string().trim().max(500).optional(),
    interests: z.array(z.string().trim().min(1).max(100)).max(50).optional(),
    photos: z.array(z.string().trim().max(500)).max(6).optional(),
  })
  .refine(
    (data) =>
      data.minAgePreference === undefined ||
      data.maxAgePreference === undefined ||
      data.minAgePreference <= data.maxAgePreference,
    {
      path: ["maxAgePreference"],
      message: "maxAgePreference must be ≥ minAgePreference",
    }
  );

// 👇 rename this so it doesn't conflict with DAO interface
export type ProfileUpdateBody = z.infer<typeof profileUpdateSchema>;
