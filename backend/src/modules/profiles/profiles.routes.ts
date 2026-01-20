// src/modules/profiles/profiles.routes.ts
import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { validateBody } from "../../middleware/validationMiddleware";
import * as ProfilesController from "./profiles.controller";
import { profileUpdateSchema } from "./profiles.validation";

const router = Router();

// GET /profiles/me
router.get("/me", authMiddleware, ProfilesController.getMe);

// PATCH /profiles/me
router.patch(
  "/me",
  authMiddleware,
  validateBody(profileUpdateSchema),
  ProfilesController.updateMe
);

// POST /profiles/admin/update-ages (optional admin endpoint)
// Note: You may want to add admin authentication middleware here
router.post("/admin/update-ages", ProfilesController.updateAges);

export default router;
