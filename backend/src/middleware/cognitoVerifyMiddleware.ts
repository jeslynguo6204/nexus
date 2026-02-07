import { Request, Response, NextFunction } from "express";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { config } from "../config/env";

export interface CognitoVerifiedRequest extends Request {
  userEmail?: string;
  cognitoSub?: string;
}

const cognitoVerifier = CognitoJwtVerifier.create({
  userPoolId: config.cognitoUserPoolId,
  tokenUse: "id",
  clientId: config.cognitoAppClientId,
});

export async function cognitoVerifyMiddleware(
  req: CognitoVerifiedRequest,
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

    req.userEmail = email;
    req.cognitoSub = sub ?? undefined;
    return next();
  } catch (error) {
    console.warn("Auth verify error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
