import dotenv from "dotenv";
dotenv.config();

import logger from "./config/logger.js";
import connectDB from "./config/db.js";
import app from "./app.js";
import { initSyncScheduler } from "./services/jobSyncScheduler.js";
import { initCleanupScheduler } from "./services/jobCleanupService.js";
import { initNotificationCleanupJob } from "./jobs/notificationCleanup.job.js";
import { connect as connectRedis } from "./config/redis.js";
import initSocket from "./socket.js";

const PORT = process.env.PORT || 5000;

let server;

// ─── Database & Server Bootstrap ──────────────────────────────────
connectDB()
  .then(() => {
    // Express App error
    app.on("error", (error) => {
      logger.error(`Express :: ERROR :: ${error}`);
      process.exit(1);
    });

    // Start Server
    server = app.listen(PORT, "0.0.0.0", async () => {
      logger.info(
        `Server running in [${process.env.NODE_ENV || "development"
        }] mode on port ${PORT}`
      );

      try {
        // Connect to Redis on server startup
        await connectRedis();
      } catch (redisErr) {
        logger.warn(`Redis connection warning: ${redisErr.message}`);
      }

      // Start the background cron services
      initSyncScheduler();
      initCleanupScheduler();
      initNotificationCleanupJob();
    });

    // Server error
    server.on("error", (error) => {
      logger.error(`SERVER :: ERROR :: ${error}`);
      process.exit(1);
    });

    // Initialize WebSocket for real-time AI interviews
    initSocket(server);
  })
  .catch((error) => {
    logger.error(`DB CONNECTION ERROR :: ${error}`);
    process.exit(1);
  });

// ─── Graceful Shutdown: unhandled promise rejections ──────────────
process.on("unhandledRejection", (err) => {
  logger.error(
    `Unhandled Rejection: ${err.name} — ${err.message}`
  );

  if (server) {
    server.close(() => {
      logger.warn(
        "Server closed after unhandledRejection. Exiting..."
      );
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// ─── Graceful Shutdown: uncaught sync exceptions ──────────────────
process.on("uncaughtException", (err) => {
  logger.error(
    `Uncaught Exception: ${err.name} — ${err.message}`
  );
  process.exit(1);
});

// ─── Graceful Shutdown: SIGTERM (Docker / Cloud Deployments) ──────
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");

  if (server) {
    server.close(() => {
      logger.info("Process terminated.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// ─── Graceful Shutdown: SIGINT (Local Server) ─────────────────────
process.on("SIGINT", () => {
  console.log("\nServer Shutting Down Gracefully");
  process.exit(0);
});