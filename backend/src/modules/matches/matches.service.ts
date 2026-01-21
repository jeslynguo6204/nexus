// backend/src/modules/matches/matches.service.ts
import { 
  getAllMatchesForUser, 
  getActiveChatMatches, 
  unmatchUser,
  getAllFriendMatchesForUser,
  getActiveFriendChatMatches,
  unmatchFriendUser,
} from "./matches.dao";

export interface FormattedMatch {
  id: number;
  match_user_id: number;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  chat_id: number | null;
}

export interface FormattedChat {
  id: number;
  match_user_id: number;
  display_name: string;
  avatar_url: string | null;
  last_message_preview: string | null;
  last_message_at: string | null;
}

export async function getAllMatches(userId: number): Promise<FormattedMatch[]> {
  const rows = await getAllMatchesForUser(userId);
  return rows.map((row) => ({
    id: row.id,
    match_user_id: row.match_user_id,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    created_at: row.created_at,
    chat_id: row.chat_id,
  }));
}

export async function getChats(userId: number): Promise<FormattedChat[]> {
  const rows = await getActiveChatMatches(userId);
  return rows.map((row) => ({
    id: row.id,
    match_user_id: row.match_user_id,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    last_message_preview: row.last_message_preview,
    last_message_at: row.last_message_at,
  }));
}

export async function unmatch(userId: number, matchId: number): Promise<void> {
  await unmatchUser(userId, matchId);
}

export async function getAllFriendMatches(userId: number): Promise<FormattedMatch[]> {
  const rows = await getAllFriendMatchesForUser(userId);
  return rows.map((row) => ({
    id: row.id,
    match_user_id: row.match_user_id,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    created_at: row.created_at,
    chat_id: row.chat_id,
  }));
}

export async function getFriendChats(userId: number): Promise<FormattedChat[]> {
  const rows = await getActiveFriendChatMatches(userId);
  return rows.map((row) => ({
    id: row.id,
    match_user_id: row.match_user_id,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    last_message_preview: row.last_message_preview,
    last_message_at: row.last_message_at,
  }));
}

export async function unmatchFriend(userId: number, matchId: number): Promise<void> {
  await unmatchFriendUser(userId, matchId);
}
