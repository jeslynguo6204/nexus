import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // For AWS RDS in dev: use SSL but don't require a trusted CA
    rejectUnauthorized: false,
  },
});

export async function dbQuery<T = any>(text: string, params?: any[]): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}
