/**
 * ============================================
 * Job Scheduler (Cron Jobs)
 * ============================================
 *
 * 📚 LEARNING NOTES:
 * - Cron jobs run tasks on a schedule (like a timer)
 * - `node-cron` uses cron expression syntax:
 *
 *   ┌──────── second (0-59) [optional]
 *   │ ┌────── minute (0-59)
 *   │ │ ┌──── hour (0-23)
 *   │ │ │ ┌── day of month (1-31)
 *   │ │ │ │ ┌ month (1-12)
 *   │ │ │ │ │ ┌ day of week (0-7, 0 and 7 = Sunday)
 *   │ │ │ │ │ │
 *   s m h d M w
 *
 * Common patterns:
 *   'every-minute'     → * * * * *
 *   'every-hour'       → 0 * * * *
 *   'every-midnight'   → 0 0 * * *
 *   'every-sunday'     → 0 0 * * 0
 *   'every-month'      → 0 0 1 * *
 *   'every-5-min'      → star-slash-5 * * * *
 *
 * Use cases:
 *   - Clean up expired sessions
 *   - Generate daily reports
 *   - Send scheduled notifications
 *   - Database maintenance
 */

const cron = require("node-cron");
const logger = require("../utils/logger");
const { broadcastNotification } = require("../websocket");

const startScheduler = () => {
  // ── Job 1: Health Heartbeat — every 5 minutes ──
  cron.schedule("*/5 * * * *", () => {
    const memUsage = process.memoryUsage();
    logger.debug("💓 Heartbeat — Server is running", {
      uptime: `${Math.round(process.uptime())}s`,
      memoryMB: Math.round(memUsage.heapUsed / 1024 / 1024),
    });
  });

  // ── Job 2: Log cleanup — every day at 2:00 AM ──
  cron.schedule("0 2 * * *", async () => {
    logger.info("🧹 Running daily log cleanup task...");
    // In a real app, you would:
    // - Delete old log files
    // - Clean up expired sessions
    // - Archive old records
    logger.info("✅ Daily cleanup completed");
  });

  // ── Job 3: Database stats — every hour ──────────
  cron.schedule("0 * * * *", async () => {
    try {
      const { User, Post } = require("../database/models");
      const userCount = await User.count();
      const postCount = await Post.count();
      logger.info(
        `📊 Database stats — Users: ${userCount}, Posts: ${postCount}`,
      );
    } catch (error) {
      logger.error("Failed to collect database stats:", error);
    }
  });

  // ── Job 4: Scheduled Notification / Toast ────────
  cron.schedule("*/1 * * * *", () => {
    logger.info("🔔 Sending scheduled cron notification");
    broadcastNotification({
      type: "cron_notification",
      data: {
        message:
          "System Check: All Node.js backend services are operating nominally.",
        timestamp: new Date().toISOString(),
      },
    });
  });

  logger.info("📅 Scheduled jobs registered");
};

module.exports = { startScheduler };
