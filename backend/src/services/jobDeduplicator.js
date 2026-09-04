import Job from '../models/Job.model.js';
import logger from '../config/logger.js';

export const deduplicateAndSave = async (rawJobs) => {
  if (!Array.isArray(rawJobs) || rawJobs.length === 0) {
    logger.info('🧹 JobDeduplicator: No jobs provided for deduplication.');
    return { success: true, processedCount: 0, updatedCount: 0, insertedCount: 0 };
  }

  const adzunaIds = rawJobs
    .map((j) => j.adzunaId)
    .filter(Boolean);

  if (adzunaIds.length === 0) {
    logger.warn('⚠️ JobDeduplicator: None of the jobs contain a valid adzunaId. Skipping sync.');
    return { success: false, error: 'No valid adzunaIds found' };
  }

  logger.info(`🧹 JobDeduplicator: Deduplicating ${rawJobs.length} jobs against MongoDB using adzunaId index...`);

  try {
    const existingJobs = await Job.find(
      { adzunaId: { $in: adzunaIds } },
      { adzunaId: 1 }
    ).lean();

    const existingIdsSet = new Set(existingJobs.map((j) => String(j.adzunaId)));
    logger.info(`🧹 JobDeduplicator: Found ${existingIdsSet.size} existing duplicate records in database.`);

    const bulkOps = rawJobs.map((job) => {
      const isDuplicate = existingIdsSet.has(String(job.adzunaId));
      
      const { createdAt, ...jobData } = job;

      if (isDuplicate) {
        return {
          updateOne: {
            filter: { adzunaId: job.adzunaId },
            update: { 
              $set: jobData 
            },
          },
        };
      } else {
        return {
          updateOne: {
            filter: { adzunaId: job.adzunaId },
            update: {
              $set: jobData,
              $setOnInsert: { createdAt: createdAt || new Date() },
            },
            upsert: true,
          },
        };
      }
    });

    const result = await Job.bulkWrite(bulkOps, { ordered: false });

    const insertedCount = result.upsertedCount + result.insertedCount;
    const updatedCount = result.modifiedCount;

    const totalStored = await Job.countDocuments();

    logger.info(`📋 MongoDB updated: ${insertedCount + updatedCount} records`);
    logger.info(`📋 Duplicate skipped: ${existingIdsSet.size} records`);
    logger.info(`📋 Total jobs stored: ${totalStored} records`);

    return {
      success: true,
      processedCount: rawJobs.length,
      insertedCount,
      updatedCount,
    };

  } catch (error) {
    logger.error(`❌ JobDeduplicator Error: ${error.message}`);
    throw error;
  }
};

export default { deduplicateAndSave };
