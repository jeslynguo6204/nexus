import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../../config/env";
import {
  findUserByEmail,
  createUserWithDefaults,
  UserRow,
} from "../users/users.dao";

export async function signup(input: {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth?: string | null;
  gender?: string;
}) {
  const upennEmailRegex = /^[A-Za-z]+@(sas|seas|wharton)\.upenn\.edu$/i;
  if (!upennEmailRegex.test(input.email)) {
    const err = new Error(
      "Email must be a UPenn address ending in @sas.upenn.edu, @seas.upenn.edu, or @wharton.upenn.edu"
    );
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
    schoolId: null,
    email: input.email,
    passwordHash,
    fullName: input.fullName,
    dateOfBirth: input.dateOfBirth ?? null,
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
