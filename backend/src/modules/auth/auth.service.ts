import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../../config/env";
import {
  findUserByEmail,
  createUserWithDefaults,
  deleteUserById,
} from "../users/users.dao";
import { resolveSchoolForEmail } from "../schools/schools.service"; // ← new import

export async function signup(input: {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth?: string | null;
  gender?: string;
  phoneNumber?: string | null;
  graduationYear?: number | null;
  datingPreferences?: {
    preference: string[] | null;
    notLooking?: boolean;
  } | null;
  friendsPreferences?: {
    preference: string[];
  } | null;
}) {
  const { email, password, fullName, dateOfBirth, gender, phoneNumber, graduationYear, datingPreferences, friendsPreferences } = input;

  // (Basic required checks can also live in the controller; this is just extra safety)
  if (!email || !password || !fullName) {
    const err = new Error("Missing required fields");
    (err as any).statusCode = 400;
    throw err;
  }

  const existing = await findUserByEmail(email);
  if (existing && existing.password_hash) {
    const err = new Error("Email is already registered");
    (err as any).statusCode = 409;
    throw err;
  }
  if (existing && !existing.password_hash) {
    await deleteUserById(existing.id);
  }

  // 🔹 NEW: resolve the school from the email using the schools table
  // This handles normal domains and the Penn special-case logic in schools.service.ts
  const school = await resolveSchoolForEmail(email);

  const passwordHash = await bcrypt.hash(password, 10);

  // Determine dating preference (array: male, female, non-binary; at least one, up to 3)
  let datingGenderPreference: string[] | null = null;
  let isDatingEnabled = false;
  if (datingPreferences && !datingPreferences.notLooking && Array.isArray(datingPreferences.preference) && datingPreferences.preference.length > 0) {
    datingGenderPreference = datingPreferences.preference;
    isDatingEnabled = true;
  }

  // Determine friends preference (array)
  const friendsGenderPreference = (Array.isArray(friendsPreferences?.preference) && friendsPreferences!.preference.length > 0)
    ? friendsPreferences!.preference
    : null;
  const isFriendsEnabled = !!friendsGenderPreference;

  const userId = await createUserWithDefaults({
    schoolId: school.id,              // 🔹 no more null
    email,
    passwordHash,
    fullName,
    dateOfBirth: dateOfBirth ?? null,
    gender,
    phoneNumber: phoneNumber ?? null,
    graduationYear: graduationYear ?? null,
    datingGenderPreference,
    friendsGenderPreference,
    isDatingEnabled,
    isFriendsEnabled,
  });

  const token = jwt.sign({ userId }, config.jwtSecret, { expiresIn: "7d" });

  return { userId, token };
}

export async function login(input: { email: string; password: string }) {
  const user = await findUserByEmail(input.email);
  if (!user || !user.password_hash) {
    const err = new Error("Invalid credentials");
    (err as any).statusCode = 401;
    throw err;
  }

  const ok = await bcrypt.compare(input.password, user.password_hash);
  if (!ok) {
    const err = new Error("Invalid credentials");
    (err as any).statusCode = 401;
    throw err;
  }

  const token = jwt.sign({ userId: user.id }, config.jwtSecret, {
    expiresIn: "7d",
  });

  return { userId: user.id, token };
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const user = await findUserByEmail(email);
  return user !== null && user.password_hash !== null;
}

export async function cleanupSignupByEmail(email: string): Promise<void> {
  const user = await findUserByEmail(email);
  if (!user) {
    return;
  }

  if (user.password_hash) {
    const err = new Error("Account has already completed signup");
    (err as any).statusCode = 409;
    throw err;
  }

  await deleteUserById(user.id);
}

export async function getSignupStatusByEmail(email: string): Promise<{
  exists: boolean;
  complete: boolean;
}> {
  const user = await findUserByEmail(email);
  if (!user) {
    return { exists: false, complete: false };
  }

  return { exists: true, complete: user.password_hash !== null };
}
