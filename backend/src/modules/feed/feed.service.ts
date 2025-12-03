import * as FeedDao from "./feed.dao";

export async function getFeedForUser(userId: number) {
  // later: add filtering logic (gender, distance, age, mode, exclusions)
  return FeedDao.getSimpleFeed();
}
