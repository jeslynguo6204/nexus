// backend/src/modules/photos/photos.dao.ts
import { dbQuery, pool } from "../../db/pool";

export type PhotoRow = {
  id: number;
  user_id: number;
  url: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export async function getPhotosForUser(userId: number): Promise<PhotoRow[]> {
  return dbQuery<PhotoRow>(
    `
    SELECT id, user_id, url, sort_order, is_primary, created_at
    FROM photos
    WHERE user_id = $1
    ORDER BY sort_order ASC, created_at ASC
    `,
    [userId]
  );
}

export async function countPhotosForUser(userId: number): Promise<number> {
  const rows = await dbQuery<{ count: string }>(
    `SELECT COUNT(*) AS count FROM photos WHERE user_id = $1`,
    [userId]
  );
  return parseInt(rows[0].count, 10);
}

export async function createPhotoForUser(input: {
  userId: number;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
}): Promise<PhotoRow> {
  const rows = await dbQuery<PhotoRow>(
    `
    INSERT INTO photos (user_id, url, sort_order, is_primary)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, url, sort_order, is_primary, created_at
    `,
    [input.userId, input.url, input.sortOrder, input.isPrimary]
  );
  return rows[0];
}

export async function getPhotoByIdForUser(
  userId: number,
  photoId: number
): Promise<PhotoRow | null> {
  const rows = await dbQuery<PhotoRow>(
    `
    SELECT id, user_id, url, sort_order, is_primary, created_at
    FROM photos
    WHERE id = $1 AND user_id = $2
    `,
    [photoId, userId]
  );
  return rows[0] ?? null;
}

export async function deletePhotoForUser(userId: number, photoId: number) {
  await dbQuery(
    `
    DELETE FROM photos
    WHERE id = $1 AND user_id = $2
    `,
    [photoId, userId]
  );
}

export async function updatePhotoPrimaryForUser(input: {
  userId: number;
  photoId: number;
  isPrimary: boolean;
}) {
  await dbQuery(
    `
    UPDATE photos
    SET is_primary = $3
    WHERE id = $1 AND user_id = $2
    `,
    [input.photoId, input.userId, input.isPrimary]
  );
}

export async function updateSortOrdersForUser(input: {
  userId: number;
  photoOrders: { photoId: number; sortOrder: number }[];
}) {
  for (const { photoId, sortOrder } of input.photoOrders) {
    await dbQuery(
      `
      UPDATE photos
      SET sort_order = $3
      WHERE id = $1 AND user_id = $2
      `,
      [photoId, input.userId, sortOrder]
    );
  }
}

export async function incrementPhotoSeenCount(photoId: number) {
  await dbQuery(
    `
    UPDATE photos
    SET seen_count = COALESCE(seen_count, 0) + 1
    WHERE id = $1
    `,
    [photoId]
  );
}

export async function incrementPhotoLikeCount(photoId: number) {
  await dbQuery(
    `
    UPDATE photos
    SET like_count = COALESCE(like_count, 0) + 1
    WHERE id = $1
    `,
    [photoId]
  );
}

export async function incrementPhotoPassCount(photoId: number) {
  await dbQuery(
    `
    UPDATE photos
    SET pass_count = COALESCE(pass_count, 0) + 1
    WHERE id = $1
    `,
    [photoId]
  );
}
