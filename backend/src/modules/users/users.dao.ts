import { pool, dbQuery } from "../../db/pool";

export interface UserRow {
  id: number;
  email: string;
  password_hash: string | null;
  full_name: string | null;
  school_id: number | null;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const rows = await dbQuery<UserRow>(
    "SELECT id, email, password_hash, full_name, school_id FROM users WHERE email = $1",
    [email]
  );
  return rows[0] ?? null;
}

export async function findUserWithProfileById(userId: number) {
  const rows = await dbQuery(
    `
    SELECT
      u.id,
      u.email,
      u.full_name,
      u.school_id,
        s.name AS school_name,
        s.short_name AS school_short_name,
      p.display_name,
      p.bio,
      p.major,
      p.graduation_year
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    LEFT JOIN schools s ON s.id = u.school_id
    WHERE u.id = $1
    `,
    [userId]
  );
  return rows[0] ?? null;
}

// user + profile + settings in one transaction
export async function createUserWithDefaults(params: {
  schoolId: number | null;
  email: string;
  passwordHash: string;
  fullName: string;
  dateOfBirth?: string | null; // 'YYYY-MM-DD'
  gender?: string | null;
}): Promise<number> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const userRes = await client.query<{ id: number }>(
      `
      INSERT INTO users (school_id, email, password_hash, full_name, date_of_birth, gender)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
      [
        params.schoolId,
        params.email,
        params.passwordHash,
        params.fullName,
        params.dateOfBirth ?? null,
        params.gender ?? null,
      ]
    );

    const userId = userRes.rows[0].id;

    // Calculate age from date_of_birth if provided
    let age: number | null = null;
    if (params.dateOfBirth) {
      const birthDate = new Date(params.dateOfBirth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    await client.query(
      `
      INSERT INTO profiles (user_id, display_name, show_me_in_discovery, date_of_birth, gender, age)
      VALUES ($1, $2, TRUE, $3, $4, $5)
      `,
      [userId, params.fullName, params.dateOfBirth ?? null, params.gender ?? null, age]
    );

    await client.query(
      `
      INSERT INTO settings (user_id)
      VALUES ($1)
      `,
      [userId]
    );

    await client.query("COMMIT");
    return userId;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
