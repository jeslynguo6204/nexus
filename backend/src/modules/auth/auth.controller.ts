import { Request, Response, NextFunction } from "express";
import * as AuthService from "./auth.service";

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, fullName, dateOfBirth, gender } = req.body;

    if (!email || !password || !fullName || !dateOfBirth) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await AuthService.signup({
      email,
      password,
      fullName,
      dateOfBirth,
      gender,
    });

    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const result = await AuthService.login({ email, password });
    return res.json(result);
  } catch (err) {
    next(err);
  }
}