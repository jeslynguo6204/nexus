import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import feedRoutes from "./modules/feed/feed.routes";
import profileRoutes from "./modules/profiles/profiles.routes";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Public routes
app.use("/auth", authRoutes);

// Authed routes
app.use("/users", userRoutes);
app.use("/profiles", profileRoutes);
app.use("/feed", feedRoutes);

// Global error handler (last)
app.use(errorHandler);