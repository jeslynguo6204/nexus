import { dbQuery } from "../../db/pool";

export interface FeedProfileRow {
  user_id: number;
  display_name: string | null;
  bio: string | null;
  major: string | null;
  graduation_year: number | null;
  // You can add more fields later
}

export async function getSimpleFeed(): Promise<FeedProfileRow[]> {
  return dbQuery<FeedProfileRow>(
    `
    SELECT
      user_id,
      display_name,
      bio,
      major,
      graduation_year
    FROM profiles
    ORDER BY updated_at DESC
    LIMIT 25
    `
  );
}
