import { ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export function validateBody(schema: ZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      console.error('Validation error:', JSON.stringify(parsed.error.errors, null, 2));
      console.error('Request body:', JSON.stringify(req.body, null, 2));
      return res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten(),
        errors: parsed.error.errors, // Include full error details for debugging
      });
    }

    // use the parsed, typed data
    req.body = parsed.data;
    next();
  };
}
