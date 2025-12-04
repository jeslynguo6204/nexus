// backend/src/modules/schools/schools.service.ts
import { findSchoolByDomain, School } from "./schools.dao";

export async function resolveSchoolForEmail(email: string): Promise<School> {
  const atIndex = email.indexOf("@");
  if (atIndex === -1) {
    const err = new Error("Invalid email format");
    (err as any).statusCode = 400;
    throw err;
  }

  const domain = email.slice(atIndex + 1).toLowerCase(); // e.g. "wharton.upenn.edu"

  // 1️⃣ Try exact domain first
  let school = await findSchoolByDomain(domain);
  if (school) return school;

  // 2️⃣ Penn special-case: treat any *.upenn.edu as 'upenn.edu'
  if (domain.endsWith(".upenn.edu")) {
    school = await findSchoolByDomain("upenn.edu");
    if (school) return school;
  }

  // 3️⃣ Generic fallback: base domain (last two labels), e.g. "cs.mit.edu" → "mit.edu"
  const parts = domain.split(".");
  if (parts.length > 2) {
    const baseDomain = parts.slice(-2).join(".");
    if (baseDomain !== domain) {
      school = await findSchoolByDomain(baseDomain);
      if (school) return school;
    }
  }

  if (!domain.endsWith(".edu") && !domain.endsWith(".ac.uk")) {
  // or whatever list you want
  const err = new Error("Only academic email addresses are supported");
  (err as any).statusCode = 400;
  throw err;
}

  const err = new Error("School for this email domain is not supported");
  (err as any).statusCode = 400;
  throw err;
}
