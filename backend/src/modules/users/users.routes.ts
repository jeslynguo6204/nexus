import { Router } from "express";
import { authMiddleware, AuthedRequest } from "../../middleware/authMiddleware";
import { findUserWithProfileById, countUsers } from "./users.dao";

const router = Router();

/** Public: count of rows in users table (e.g. for launch / coming-soon screens) */
router.get("/count", async (_req, res) => {
  try {
    const count = await countUsers();
    return res.json({ count });
  } catch (err) {
    console.error("GET /users/count error:", err);
    return res.status(500).json({ error: "Failed to get user count" });
  }
});

router.get("/me", authMiddleware, async (req: AuthedRequest, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const user = await findUserWithProfileById(req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({ user });
});

export default router;