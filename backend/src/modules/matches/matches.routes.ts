// backend/src/modules/matches/matches.routes.ts
import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { getAllMatchesController, getChatsController } from "./matches.controller";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /matches/all - Get all matches for current user (including no-chat-yet)
router.get("/all", getAllMatchesController);

// GET /matches/chats - Get only matches with active chats
router.get("/chats", getChatsController);

export default router;
