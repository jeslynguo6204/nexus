// backend/src/modules/photos/photos.controller.ts

import type { Response } from "express";
import type { AuthedRequest } from "../../middleware/authMiddleware"; // or ../../middleware/authMiddleware if you rename

import {
  listMyPhotos,
  addPhotoForUser,
  setPrimaryPhoto,
  reorderPhotos,
  removePhoto,
  trackPhotoView,
  trackPhotoLike,
  trackPhotoPass,
} from "./photos.service";

export async function getMyPhotosController(req: AuthedRequest, res: Response) {
  try {
    const photos = await listMyPhotos(req.userId!);
    res.json({ photos });
  } catch (err: any) {
    console.error("GET /photos/me error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function addPhotoController(req: AuthedRequest, res: Response) {
  try {
    const { url } = req.body;

    if (!url) return res.status(400).json({ error: "url is required" });

    const photo = await addPhotoForUser(req.userId!, url);
    res.status(201).json({ photo });
  } catch (err: any) {
    console.error("POST /photos/me error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function setPrimaryPhotoController(req: AuthedRequest, res: Response) {
  try {
    const photoId = Number(req.params.photoId);
    if (isNaN(photoId)) return res.status(400).json({ error: "Invalid photoId" });

    await setPrimaryPhoto(req.userId!, photoId);
    res.json({ success: true });
  } catch (err: any) {
    console.error("PATCH /photos/me/:photoId/primary error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function reorderPhotosController(req: AuthedRequest, res: Response) {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: "order must be an array" });
    }

    await reorderPhotos(req.userId!, order);
    res.json({ success: true });
  } catch (err: any) {
    console.error("POST /photos/me/reorder error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function deletePhotoController(req: AuthedRequest, res: Response) {
  try {
    const photoId = Number(req.params.photoId);
    if (isNaN(photoId)) return res.status(400).json({ error: "Invalid photoId" });

    await removePhoto(req.userId!, photoId);
    res.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /photos/me/:photoId error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function trackPhotoViewController(req: AuthedRequest, res: Response) {
  try {
    const photoId = Number(req.params.photoId);
    if (isNaN(photoId)) return res.status(400).json({ error: "Invalid photoId" });

    await trackPhotoView(photoId);
    res.json({ success: true });
  } catch (err: any) {
    console.error("POST /photos/:photoId/view error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function trackPhotoLikeController(req: AuthedRequest, res: Response) {
  try {
    const photoId = Number(req.params.photoId);
    if (isNaN(photoId)) return res.status(400).json({ error: "Invalid photoId" });

    await trackPhotoLike(photoId);
    res.json({ success: true });
  } catch (err: any) {
    console.error("POST /photos/:photoId/like error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function trackPhotoPassController(req: AuthedRequest, res: Response) {
  try {
    const photoId = Number(req.params.photoId);
    if (isNaN(photoId)) return res.status(400).json({ error: "Invalid photoId" });

    await trackPhotoPass(photoId);
    res.json({ success: true });
  } catch (err: any) {
    console.error("POST /photos/:photoId/pass error:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}
