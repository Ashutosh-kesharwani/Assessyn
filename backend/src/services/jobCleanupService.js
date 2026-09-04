import cron from 'node-cron';
import Job from '../models/Job.model.js';
import logger from '../config/logger.js';

let isCleaning = false;

export const runJobCleanup = async () => {
  if (isCleaning) {
    logger.warn('🧹 Job Cleanup Service: Previous cleanup run is still in progress. Skipping...');
    return;
  }

  isCleaning = true;
  logger.info('🧹 Job Cleanup Service: Starting soft deactivation run for old jobs...');

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    logger.info(`🧹 Job Cleanup Service: Searching for jobs older than ${cutoffDate.toISOString()}...`);

    const result = await Job.updateMany(
      {
        $or: [
          { postedTime: { $lt: cutoffDate } },
          { createdAt: { $lt: cutoffDate } }
        ],
        isActive: true
      },
      {
        $set: { isActive: false }
      }
    );

    logger.info(`✅ Job Cleanup Service Completed. Deactivated (isActive = false): ${result.modifiedCount} jobs.`);
    return {
      success: true,
      deactivatedCount: result.modifiedCount
    };

  } catch (error) {
    logger.error(`❌ Job Cleanup Service Error: ${error.message}`);
    throw error;
  } finally {
    isCleaning = false;
  }
};

export const initCleanupScheduler = () => {
  logger.info('⚙️ Initializing Daily Job Cleanup Cron Daemon...');

  setTimeout(() => {
    logger.info('⏰ Triggering initial startup job cleanup run...');
    runJobCleanup();
  }, 30 * 1000);

  cron.schedule('0 0 * * *', () => {
    logger.info('⏰ Cron triggered: Starting daily job cleanup schedule...');
    runJobCleanup();
  });

  logger.info('✅ Daily Job Cleanup Cron Daemon successfully scheduled: [0 0 * * *]');
};

export default { runJobCleanup, initCleanupScheduler };
