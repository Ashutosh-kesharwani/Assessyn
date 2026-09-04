import { fetchJobs } from './adzunaService.js';
import { deduplicateAndSave } from './jobDeduplicator.js';
import logger from '../config/logger.js';

export const syncJobs = async (keyword, location, page = 1) => {
  logger.info(`🔄 JobSyncService: Starting synchronization for keyword: "${keyword}", location: "${location}", page: ${page}...`);

  try {
    const jobs = await fetchJobs(keyword, location, page);

    if (!Array.isArray(jobs) || jobs.length === 0) {
      logger.info('🔄 JobSyncService: No jobs retrieved from Adzuna. Synchronization complete.');
      return { success: true, matchedCount: 0, upsertedCount: 0, modifiedCount: 0 };
    }

    const result = await deduplicateAndSave(jobs);

    return {
      success: true,
      matchedCount: result.updatedCount,
      upsertedCount: result.insertedCount,
      modifiedCount: result.updatedCount,
    };

  } catch (error) {
    logger.error(`❌ JobSyncService failed: ${error.message}`);
    throw error;
  }
};

export default { syncJobs };
