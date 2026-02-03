import { Request, Response, NextFunction } from "express";
import * as AuthService from "./auth.service";

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("📝 Signup attempt received");
    const { email, password, fullName, dateOfBirth, gender, phoneNumber, graduationYear, datingPreferences, friendsPreferences } = req.body;

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
      graduationYear,
      datingPreferences,
      friendsPreferences,
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

export async function checkEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    // Check if email exists
    const exists = await AuthService.checkEmailExists(email);
    if (exists) {
      return res.json({ exists: true });
    }
    
    // Validate school availability
    try {
      const { resolveSchoolForEmail } = require("../schools/schools.service");
      await resolveSchoolForEmail(email);
      return res.json({ exists: false });
    } catch (schoolError: any) {
      console.log("School validation error:", schoolError.message);
      // If school validation fails, return appropriate error
      if (schoolError.message === "Must be a school email") {
        console.log("Returning: Must be a school email");
        return res.status(400).json({ 
          error: "Must be a school email",
          exists: false 
        });
      }
      if (schoolError.message === "That school isn't supported yet") {
        console.log("Returning: That school isn't supported yet");
        return res.status(400).json({ 
          error: "That school isn't supported yet",
          exists: false 
        });
      }
      // Re-throw other errors
      console.log("Re-throwing school error:", schoolError);
      throw schoolError;
    }
  } catch (err) {
    console.error("❌ Check email error:", err);
    next(err);
  }
}
export async function createProfileFromOtp(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("📝 Create profile from OTP received");
    const { email, password, fullName, dateOfBirth, gender, phoneNumber, graduationYear } = req.body;

    if (!email || !password || !fullName) {
      console.log("❌ Create profile failed: Missing required fields");
      return res.status(400).json({ error: "Missing required fields: email, password, fullName" });
    }

    const result = await AuthService.createProfileFromOtp({
      email,
      password,
      fullName,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      phoneNumber: phoneNumber || null,
      graduationYear: graduationYear || null,
    });
    console.log(`✅ Profile created from OTP for: ${email}, userId: ${result.userId}`);
    return res.status(201).json(result);
  } catch (err) {
    console.error("❌ Create profile from OTP error:", err);
    next(err);
  }
}