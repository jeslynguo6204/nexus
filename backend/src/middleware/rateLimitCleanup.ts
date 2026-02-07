import { Request, Response, NextFunction } from "express";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const getClientKey = (req: Request) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || "unknown";
};

export function rateLimitCleanup(req: Request, res: Response, next: NextFunction) {
  const key = getClientKey(req);
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (bucket.count >= MAX_REQUESTS) {
    return res.status(429).json({ error: "Too many cleanup attempts. Please try again shortly." });
  }

  bucket.count += 1;
  return next();
}
