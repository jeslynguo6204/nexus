import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";

export interface AuthedRequest extends Request {
  userId?: number;
}

export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Invalid Authorization header format" });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as { userId: number };
    req.userId = payload.userId;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
