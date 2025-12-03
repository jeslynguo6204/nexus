import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import * as ProfilesController from "./profiles.controller";

const router = Router();

// GET /profiles/me
router.get("/me", authMiddleware, ProfilesController.getMe);

// PATCH /profiles/me
router.patch("/me", authMiddleware, ProfilesController.updateMe);

export default router;