// backend/src/modules/photos/photos.routes.ts

import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";

import {
  getMyPhotosController,
  addPhotoController,
  setPrimaryPhotoController,
  reorderPhotosController,
  deletePhotoController,
} from "./photos.controller";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/me", getMyPhotosController);
router.post("/me", addPhotoController);
router.patch("/me/:photoId/primary", setPrimaryPhotoController);
router.post("/me/reorder", reorderPhotosController);
router.delete("/me/:photoId", deletePhotoController);

export default router;
