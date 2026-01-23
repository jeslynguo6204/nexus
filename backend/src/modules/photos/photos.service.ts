// backend/src/modules/photos/photos.service.ts
import {
  getPhotosForUser,
  countPhotosForUser,
  createPhotoForUser,
  getPhotoByIdForUser,
  deletePhotoForUser,
  updatePhotoPrimaryForUser,
  updateSortOrdersForUser,
  incrementPhotoSeenCount,
  incrementPhotoLikeCount,
  incrementPhotoPassCount,
  PhotoRow,
} from "./photos.dao";
import { pool } from "../../db/pool";

export async function listMyPhotos(userId: number) {
  return getPhotosForUser(userId);
}

export async function addPhotoForUser(userId: number, url: string) {
  const currentCount = await countPhotosForUser(userId);
  if (currentCount >= 6) {
    const err = new Error("You can only have up to 6 photos");
    (err as any).statusCode = 400;
    throw err;
  }

  const photos = await getPhotosForUser(userId);

  const isPrimary = photos.length === 0;
  const sortOrder =
    photos.length === 0
      ? 0
      : Math.max(...photos.map((p) => p.sort_order)) + 1;

  return createPhotoForUser({
    userId,
    url,
    sortOrder,
    isPrimary,
  });
}

export async function setPrimaryPhoto(userId: number, photoId: number) {
  const photo = await getPhotoByIdForUser(userId, photoId);
  if (!photo) {
    const err = new Error("Photo not found");
    (err as any).statusCode = 404;
    throw err;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE photos SET is_primary = FALSE WHERE user_id = $1`,
      [userId]
    );

    await client.query(
      `UPDATE photos SET is_primary = TRUE WHERE id = $1 AND user_id = $2`,
      [photoId, userId]
    );

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function reorderPhotos(userId: number, newOrder: number[]) {
  const photos = await getPhotosForUser(userId);
  const photoIds = photos.map((p) => p.id);

  const valid =
    newOrder.length === photoIds.length &&
    newOrder.every((id) => photoIds.includes(id));

  if (!valid) {
    const err = new Error("Invalid photo order");
    (err as any).statusCode = 400;
    throw err;
  }

  await updateSortOrdersForUser({
    userId,
    photoOrders: newOrder.map((photoId, index) => ({
      photoId,
      sortOrder: index,
    })),
  });

  if (newOrder.length > 0) {
    await setPrimaryPhoto(userId, newOrder[0]);
  }
}

export async function removePhoto(userId: number, photoId: number) {
  const photo = await getPhotoByIdForUser(userId, photoId);
  if (!photo) {
    const err = new Error("Photo not found");
    (err as any).statusCode = 404;
    throw err;
  }

  const wasPrimary = photo.is_primary;

  await deletePhotoForUser(userId, photoId);

  if (wasPrimary) {
    const remaining = await getPhotosForUser(userId);
    if (remaining.length > 0) {
      await setPrimaryPhoto(userId, remaining[0].id);
    }
  }
}

export async function trackPhotoView(photoId: number) {
  await incrementPhotoSeenCount(photoId);
}

export async function trackPhotoLike(photoId: number) {
  await incrementPhotoLikeCount(photoId);
}

export async function trackPhotoPass(photoId: number) {
  await incrementPhotoPassCount(photoId);
}
