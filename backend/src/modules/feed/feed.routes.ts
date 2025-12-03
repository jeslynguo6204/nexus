import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import * as FeedController from "./feed.controller";

const router = Router();

// GET /feed
router.get("/", authMiddleware, FeedController.getFeed);

export default router;