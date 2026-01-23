// backend/src/modules/messages/messages.routes.ts
import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { sendMessageController, getMessagesController } from "./messages.controller";

const router = Router();

// Send message (creates chat + message transactionally)
router.post("/:matchId/send", authMiddleware, sendMessageController);

// Get messages for a chat
router.get("/chat/:chatId", authMiddleware, getMessagesController);

export default router;
