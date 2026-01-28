import { Request, Response, NextFunction } from "express";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { config } from "../config/env";
import { findUserByEmail, createUserWithDefaults } from "../modules/users/users.dao";
import { resolveSchoolForEmail } from "../modules/schools/schools.service";

export interface AuthedRequest extends Request {
  userId?: number;
  userEmail?: string;
  cognitoSub?: string;
}

const cognitoVerifier = CognitoJwtVerifier.create({
  userPoolId: config.cognitoUserPoolId,
  tokenUse: "id",
  clientId: config.cognitoAppClientId,
});

const deriveNameFromEmail = (email: string) => {
  const base = email.split("@")[0] || "Student";
  const withSpaces = base.replace(/[._-]+/g, " ");
  return withSpaces.replace(/\b\w/g, (c) => c.toUpperCase());
};

export async function authMiddleware(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Invalid Authorization header format" });
  }

  try {
    const payload = await cognitoVerifier.verify(token);
    const email = typeof payload.email === "string" ? payload.email : null;
    const sub = typeof payload.sub === "string" ? payload.sub : null;

    if (!email) {
      return res.status(401).json({ error: "Token is missing email claim" });
    }

    let user = await findUserByEmail(email);
    if (!user) {
      const school = await resolveSchoolForEmail(email);
      const fullName = deriveNameFromEmail(email);
      const userId = await createUserWithDefaults({
        schoolId: school?.id ?? null,
        email,
        passwordHash: null,
        fullName,
        dateOfBirth: null,
        gender: null,
        phoneNumber: null,
      });
      user = {
        id: userId,
        email,
        password_hash: null,
        full_name: fullName,
        school_id: school?.id ?? null,
      };
    }

    req.userId = user.id;
    req.userEmail = email;
    req.cognitoSub = sub ?? undefined;
    return next();
  } catch (error) {
    console.warn("Auth verify error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
