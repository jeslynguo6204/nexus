import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import profileRoutes from "./modules/profiles/profiles.routes";
import photosRoutes from "./modules/photos/photos.routes";
import feedRoutes from "./modules/feed/feed.routes";
import { errorHandler } from "./middleware/errorHandlerMiddleware";

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
app.use("/photos", photosRoutes);
app.use("/feed", feedRoutes);

// Global error handler (last)
app.use(errorHandler);