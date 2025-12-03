import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../../config/env";
import { findSchoolByDomain } from "../schools/schools.dao";
import {
  findUserByEmail,
  createUserWithDefaults,
  UserRow,
} from "../users/users.dao";

export async function signup(input: {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth: string;
  gender?: string;
}) {
  const domain = input.email.split("@")[1];
  if (!domain) {
    const err = new Error("Invalid email");
    (err as any).statusCode = 400;
    throw err;
  }

  const school = await findSchoolByDomain(domain);
  if (!school) {
    const err = new Error("This email domain is not supported");
    (err as any).statusCode = 400;
    throw err;
  }

  const existing = await findUserByEmail(input.email);
  if (existing) {
    const err = new Error("Email is already registered");
    (err as any).statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const userId = await createUserWithDefaults({
    schoolId: school.id,
    email: input.email,
    passwordHash,
    fullName: input.fullName,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender,
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

  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: "7d" });

  return { userId: user.id, token };
}