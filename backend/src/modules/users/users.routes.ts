import { Router } from "express";
import { authMiddleware, AuthedRequest } from "../../middleware/auth";
import { findUserWithProfileById } from "./users.dao";

const router = Router();

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