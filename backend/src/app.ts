import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import profileRoutes from "./modules/profiles/profiles.routes";
import photosRoutes from "./modules/photos/photos.routes";
import feedRoutes from "./modules/feed/feed.routes";
import affiliationsRoutes from "./modules/affiliations/affiliations.routes";
import { errorHandler } from "./middleware/errorHandlerMiddleware";

export const app = express();

console.log("🚀 Initializing Express app...");

// Request logging middleware (add before other middleware)
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log(`\n📥 [${timestamp}] ${req.method} ${req.path}`);
  console.log(`   From: ${req.ip || req.socket.remoteAddress || 'unknown'}`);
  if (req.headers['user-agent']) {
    console.log(`   User-Agent: ${req.headers['user-agent'].substring(0, 50)}...`);
  }
  
  // Log request body for POST/PUT requests (but not passwords)
  if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
    const bodyCopy = { ...req.body };
    if (bodyCopy.password) bodyCopy.password = '***';
    console.log(`   Body:`, JSON.stringify(bodyCopy));
  }
  
  // Log response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📤 [${timestamp}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
console.log("✅ Middleware configured (CORS, JSON parser, request logging)");

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});
console.log("✅ Health check endpoint: GET /health");

// Public routes
app.use("/auth", authRoutes);
console.log("✅ Auth routes registered: /auth/*");

// Authed routes
app.use("/users", userRoutes);
app.use("/profiles", profileRoutes);
app.use("/photos", photosRoutes);
app.use("/feed", feedRoutes);
app.use("/affiliations", affiliationsRoutes);
console.log("✅ Protected routes registered:");
console.log("   - /users/*");
console.log("   - /profiles/*");
console.log("   - /photos/*");
console.log("   - /feed/*");
console.log("   - /affiliations/*");

// Global error handler (last)
app.use(errorHandler);
console.log("✅ Error handler configured");