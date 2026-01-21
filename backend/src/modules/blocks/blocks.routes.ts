// backend/src/modules/blocks/blocks.routes.ts
import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import {
  blockUserController,
  unblockUserController,
  checkBlockedController,
  getBlockedListController,
  reportUserController,
} from "./blocks.controller";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// POST /blocks/block/:userId - Block a user
router.post("/block/:userId", blockUserController);

// POST /blocks/unblock/:userId - Unblock a user
router.post("/unblock/:userId", unblockUserController);

// GET /blocks/check/:userId - Check if user is blocked
router.get("/check/:userId", checkBlockedController);

// GET /blocks/list - Get list of blocked users
router.get("/list", getBlockedListController);

// POST /blocks/report/:userId - Report a user
router.post("/report/:userId", reportUserController);

export default router;

