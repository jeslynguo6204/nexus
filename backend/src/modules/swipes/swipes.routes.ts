// backend/src/modules/swipes/swipes.routes.ts
import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";

import { likeUserController, passUserController, getReceivedLikesController } from "./swipes.controller";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// POST /swipes/like/:userId - Like a user (swipe right)
router.post("/like/:userId", likeUserController);

// POST /swipes/pass/:userId - Pass on a user (swipe left)
router.post("/pass/:userId", passUserController);

// GET /swipes/received - Get profiles that have liked you (received likes)
router.get("/received", getReceivedLikesController);

export default router;
