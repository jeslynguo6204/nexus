import { Request, Response, NextFunction } from "express";
import * as AuthService from "./auth.service";

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("📝 Signup attempt received");
    const { email, password, fullName, dateOfBirth, gender, phoneNumber } = req.body;

    if (!email || !password || !fullName) {
      console.log("❌ Signup failed: Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log(`📝 Attempting signup for: ${email}, name: ${fullName}`);
    const result = await AuthService.signup({
      email,
      password,
      fullName,
      dateOfBirth,
      gender,
      phoneNumber,
    });

    console.log(`✅ Signup successful for: ${email}, userId: ${result.userId}`);
    return res.status(201).json(result);
  } catch (err) {
    console.error("❌ Signup error:", err);
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("🔐 Login attempt received");
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("❌ Login failed: Missing email or password");
      return res.status(400).json({ error: "Missing email or password" });
    }

    console.log(`🔐 Attempting login for: ${email}`);
    const result = await AuthService.login({ email, password });
    console.log(`✅ Login successful for: ${email}, userId: ${result.userId}`);
    return res.json(result);
  } catch (err) {
    console.error("❌ Login error:", err);
    next(err);
  }
}
