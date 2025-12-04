import { ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export function validateBody(schema: ZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
    }

    // use the parsed, typed data
    req.body = parsed.data;
    next();
  };
}
