import cron from 'node-cron';
import { syncJobs } from './jobSyncService.js';
import logger from '../config/logger.js';

let isSyncing = false;

export const runScheduledSync = async () => {
  if (isSyncing) {
    logger.warn('🔄 Job Sync Scheduler: Previous sync is still running. Skipping...');
    return;
  }

  isSyncing = true;
  logger.info('📋 Cron started: Adzuna Job Sync');

  try {
    const keyword = 'developer';
    const location = '';
    const page = 1;

    const result = await syncJobs(keyword, location, page);

    const fetchedCount = (result.upsertedCount || 0) + (result.matchedCount || 0);

    logger.info(`📋 Jobs Fetched: ${fetchedCount}`);
    logger.info(`📋 Jobs Updated: ${result.modifiedCount || 0}`);
    logger.info(`📋 Jobs Inserted: ${result.upsertedCount || 0}`);
    logger.info('📋 Sync Completed');

  } catch (error) {
    logger.error(`❌ Job Sync Scheduler Error: ${error.message}`);
  } finally {
    isSyncing = false;
  }
};

export const initSyncScheduler = () => {
  logger.info('⚙️ Initializing Adzuna Job Sync Cron Daemon...');

  setTimeout(() => {
    logger.info('⏰ Triggering initial startup Adzuna sync run...');
    runScheduledSync();
  }, 15 * 1000);

  cron.schedule('0 */3 * * *', () => {
    logger.info('⏰ Cron triggered: Starting Adzuna Job Sync schedule...');
    runScheduledSync();
  });

  logger.info('✅ Adzuna Job Sync Cron Daemon successfully scheduled: [0 */3 * * *]');
};

export default { initSyncScheduler, runScheduledSync };
