import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../../config/env";
import {
  findUserByEmail,
  createUserWithDefaults,
} from "../users/users.dao";
import { resolveSchoolForEmail } from "../schools/schools.service"; // ← new import

export async function signup(input: {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth?: string | null;
  gender?: string;
}) {
  const { email, password, fullName, dateOfBirth, gender } = input;

  // (Basic required checks can also live in the controller; this is just extra safety)
  if (!email || !password || !fullName) {
    const err = new Error("Missing required fields");
    (err as any).statusCode = 400;
    throw err;
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error("Email is already registered");
    (err as any).statusCode = 409;
    throw err;
  }

  // 🔹 NEW: resolve the school from the email using the schools table
  // This handles normal domains and the Penn special-case logic in schools.service.ts
  const school = await resolveSchoolForEmail(email);

  const passwordHash = await bcrypt.hash(password, 10);

  const userId = await createUserWithDefaults({
    schoolId: school.id,              // 🔹 no more null
    email,
    passwordHash,
    fullName,
    dateOfBirth: dateOfBirth ?? null,
    gender,
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
