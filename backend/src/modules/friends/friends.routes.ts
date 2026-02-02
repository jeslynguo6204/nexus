import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import {
  sendFriendRequestController,
  acceptFriendRequestController,
  declineFriendRequestController,
  cancelFriendRequestController,
  removeFriendController,
  getPendingRequestsController,
  getPendingRequestsDetailedController,
  getSentRequestsController,
  getFriendsListController,
  getMutualFriendsController,
  getFriendCountController,
  checkFriendshipStatusController,
} from "./friends.controller";

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Friend request management
router.post("/request/:userId", sendFriendRequestController);
router.post("/accept/:userId", acceptFriendRequestController);
router.post("/decline/:userId", declineFriendRequestController);
router.delete("/request/:userId", cancelFriendRequestController);

// Friend management
router.delete("/:userId", removeFriendController);

// Get friend data
router.get("/list", getFriendsListController);
router.get("/mutuals/:userId", getMutualFriendsController);
router.get("/count", getFriendCountController);
router.get("/requests/pending", getPendingRequestsController);
router.get("/requests/pending/detailed", getPendingRequestsDetailedController);
router.get("/requests/sent", getSentRequestsController);
router.get("/status/:userId", checkFriendshipStatusController);

export default router;
