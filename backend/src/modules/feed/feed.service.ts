import * as FeedDao from "./feed.dao";

export async function getFeedForUser(userId: number) {
  // later: add filtering logic (gender, distance, age, mode, exclusions)
  const rows = await FeedDao.getSimpleFeed();

  // shape school object for frontend consumers
  return rows.map((row) => ({
    ...row,
    school: {
      id: row.school_id,
      name: row.school_name,
      short_name: row.school_short_name,
    },
  }));
}
