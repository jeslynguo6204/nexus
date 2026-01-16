import { app } from "./app";
import { config } from "./config/env";
import { pool } from "./db/pool";

async function startServer() {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 Starting Six Degrees Backend Server");
  console.log("=".repeat(50) + "\n");

  // Test database connection
  console.log("📊 Testing database connection...");
  try {
    const result = await pool.query("SELECT NOW() as current_time, version() as pg_version");
    const dbTime = result.rows[0].current_time;
    const pgVersion = result.rows[0].pg_version.split(" ")[0] + " " + result.rows[0].pg_version.split(" ")[1];
    console.log("✅ Database connected successfully");
    console.log(`   PostgreSQL version: ${pgVersion}`);
    console.log(`   Server time: ${dbTime}\n`);
  } catch (error) {
    console.error("❌ Database connection failed!");
    console.error(`   Error: ${(error as Error).message}\n`);
    console.error("⚠️  Server will start but database operations will fail.");
    console.error("   Please check your DATABASE_URL environment variable.\n");
  }

  // Start server
  console.log("🌐 Starting HTTP server...");
  app.listen(config.port, "0.0.0.0", () => {
    console.log("\n" + "=".repeat(50));
    console.log("✅ Server is running and ready!");
    console.log("=".repeat(50));
    console.log(`📍 Local access:    http://localhost:${config.port}`);
    console.log(`🌍 Network access:   http://0.0.0.0:${config.port}`);
    console.log(`📱 Mobile app:       Use your computer's IP address`);
    console.log(`🔍 Health check:    http://localhost:${config.port}/health`);
    console.log("=".repeat(50) + "\n");
    console.log("💡 Tip: To find your IP address, run: ifconfig | grep 'inet '");
    console.log("   Or on Mac: ipconfig getifaddr en0\n");
  });
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("\n⚠️  SIGTERM received, shutting down gracefully...");
  await pool.end();
  console.log("✅ Database pool closed");
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("\n⚠️  SIGINT received, shutting down gracefully...");
  await pool.end();
  console.log("✅ Database pool closed");
  process.exit(0);
});

startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
