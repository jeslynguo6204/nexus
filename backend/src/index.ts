import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "./db";

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

app.use(cors());
app.use(express.json());

type AuthedRequest = express.Request & { userId?: number };

// helper function: create JWT
function createToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

// middleware: verify JWT
function authMiddleware(
  req: AuthedRequest,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const [, token] = authHeader.split(" ");
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ---------- REGISTER NEW USERS ----------
app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age,
      gender,
      school,
      graduation_year,
      bio,
      interests,
      location,
    } = req.body;

    if (!name || !email || !password || !age || !school) {
      return res.status(400).json({ error: "Missing required fields" });
    }

const existing = await pool.query(
  "SELECT user_id FROM users WHERE email = $1",
  [email]
);


const existingCount = existing.rowCount ?? 0;

if (existingCount > 0) {
  return res.status(400).json({ error: "Email already in use" });
}

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
        (name, email, password_hash, age, gender, school,
         graduation_year, bio, interests, location)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING user_id, name, email, age, school`,
      [
        name,
        email,
        hash,
        age,
        gender,
        school,
        graduation_year,
        bio,
        interests,
        location,
      ]
    );

    const user = result.rows[0];
    const token = createToken(user.user_id);

    res.json({ token, user });
  } catch (err) {
    console.error("Error in /register:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------- LOGIN EXISTING USERS----------
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const result = await pool.query(
      `SELECT user_id, email, password_hash, name, age, school
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = createToken(user.user_id);

    res.json({
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        age: user.age,
        school: user.school,
      },
    });
  } catch (err) {
    console.error("Error in /login:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ---------- CURRENT USER PROFILE ----------
app.get("/api/me", authMiddleware, async (req: AuthedRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Not authorized" });

    const result = await pool.query(
      `SELECT user_id, name, email, age, gender, school,
              graduation_year, bio, interests, location
       FROM users
       WHERE user_id = $1`,
      [req.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error in /me:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Nexus backend running on port ${PORT}`);
});
