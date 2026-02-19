// backend/src/modules/messages/messages.routes.ts
import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import {
  sendMessageController,
  getMessagesController,
  markMessagesAsReadController,
  getUnreadConversationsCountController
} from "./messages.controller";

const router = Router();

// Send message (creates chat + message transactionally)
router.post("/:matchId/send", authMiddleware, sendMessageController);

// Get messages for a chat
router.get("/chat/:chatId", authMiddleware, getMessagesController);

// Mark messages as read
router.post("/chat/:chatId/mark-read", authMiddleware, markMessagesAsReadController);

// Get count of conversations with unread messages
router.get("/unread-count", authMiddleware, getUnreadConversationsCountController);

export default router;
