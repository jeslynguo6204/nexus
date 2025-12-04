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

export default router;
