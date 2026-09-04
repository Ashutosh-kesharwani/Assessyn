import cron from 'node-cron';
import Notification from '../models/Notification.model.js';
import logger from '../config/logger.js';

let isRunning = false;

/**
 * Deactivates expired notifications whose scheduled duration has passed
 */
export const runNotificationCleanup = async () => {
  if (isRunning) {
    logger.warn('🧹 Notification Cleanup: Previous run is still in progress. Skipping...');
    return;
  }

  isRunning = true;
  try {
    const now = new Date();
    const result = await Notification.updateMany(
      {
        expiresAt: { $lte: now },
        isActive: true,
      },
      {
        $set: { isActive: false },
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`✅ Notification Cleanup: Soft-deactivated ${result.modifiedCount} expired announcements.`);
    }
    return {
      success: true,
      deactivatedCount: result.modifiedCount,
    };
  } catch (error) {
    logger.error(`❌ Notification Cleanup Error: ${error.message}`);
  } finally {
    isRunning = false;
  }
};

/**
 * Initializes cron schedule for notification cleanup
 * Runs every hour at minute 0: '0 * * * *'
 */
export const initNotificationCleanupJob = () => {
  const cronExpression = '0 * * * *';

  cron.schedule(cronExpression, async () => {
    logger.info('⏰ Triggering scheduled Notification Cleanup run...');
    await runNotificationCleanup();
  });

  logger.info(`✅ Notification Cleanup Cron successfully scheduled: [${cronExpression}]`);

  // Run initial pass after 10s server startup
  setTimeout(() => {
    runNotificationCleanup().catch(() => {});
  }, 10000);
};

export default {
  runNotificationCleanup,
  initNotificationCleanupJob,
};
