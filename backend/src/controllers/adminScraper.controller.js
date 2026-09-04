import ScraperConfig from '../models/ScraperConfig.model.js';
import ScraperLog from '../models/ScraperLog.model.js';
import Job from '../models/Job.model.js';
import User from '../models/User.model.js';
import adzunaService from '../services/adzuna.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';

const ADMIN_EMAIL = 'admin@gmail.com';

let schedulerIntervalId = null;

const runScrapeExecution = async (config, runByAdminId = null) => {
  const startTime = new Date();

  const log = await ScraperLog.create({
    startTime,
    status: 'running',
  });

  try {
    let adminId = runByAdminId;
    if (!adminId) {
      const superAdmin = await User.findOne({ email: ADMIN_EMAIL });
      adminId = superAdmin ? superAdmin._id : null;
    }

    if (!adminId) {
      throw new Error('No admin user found to associate with imported job listings.');
    }

    let jobsImported = 0;
    let jobsUpdated = 0;
    let duplicateCount = 0;

    for (const keyword of config.keywords) {
      try {
        const searchResults = await adzunaService.searchJobs({
          what: keyword,
          country: config.country || 'us',
          results: config.maxJobs || 20,
        });

        const rawJobsList = searchResults?.jobs || [];

        for (const rJob of rawJobsList) {
          let contractType = 'full_time';
          if (rJob.contract === 'part_time') contractType = 'part_time';
          if (rJob.contract === 'contract') contractType = 'contract';
          if (rJob.contract === 'internship') contractType = 'internship';

          const existing = await Job.findOne({
            title: { $regex: `^${rJob.title.trim()}$`, $options: 'i' },
            company: { $regex: `^${rJob.company.trim()}$`, $options: 'i' },
            location: { $regex: `^${rJob.location.trim()}$`, $options: 'i' },
          });

          if (existing) {
            if (existing.isArchived) {
              existing.isArchived = false;
              await existing.save();
              jobsUpdated++;
            } else {
              duplicateCount++;
            }
          } else {
            await Job.create({
              title: rJob.title.trim(),
              company: rJob.company.trim(),
              location: rJob.location ? rJob.location.trim() : 'Remote',
              description: rJob.description || 'No description provided.',
              salaryMin: rJob.salary_min || null,
              salaryMax: rJob.salary_max || null,
              contractType,
              category: rJob.category || 'General',
              applyUrl: rJob.url || '',
              postedBy: adminId,
            });
            jobsImported++;
          }
        }
      } catch (err) {
        logger.error(`[Scraper] Error fetching keyword "${keyword}": ${err.message}`);
      }
    }

    log.endTime = new Date();
    log.status = 'success';
    log.jobsImported = jobsImported;
    log.jobsUpdated = jobsUpdated;
    log.duplicateCount = duplicateCount;
    await log.save();

    config.lastRun = new Date();
    config.status = 'idle';
    await config.save();
  } catch (err) {
    log.endTime = new Date();
    log.status = 'failed';
    log.error = err.message;
    await log.save();

    config.status = 'idle';
    await config.save();
    logger.error(`[Scraper] Job Scrape task failed: ${err.message}`);
  }
};

export const initScraperScheduler = async () => {
  try {
    let config = await ScraperConfig.findOne();
    if (!config) {
      config = await ScraperConfig.create({});
    }

    if (schedulerIntervalId) {
      clearInterval(schedulerIntervalId);
      schedulerIntervalId = null;
    }

    if (config.isActiveScheduler && config.status !== 'paused') {
      const intervalMs = config.scrapeInterval * 60 * 1000;
      schedulerIntervalId = setInterval(async () => {
        const activeConfig = await ScraperConfig.findOne();
        if (activeConfig && activeConfig.isActiveScheduler && activeConfig.status !== 'paused') {
          activeConfig.status = 'running';
          await activeConfig.save();
          await runScrapeExecution(activeConfig);
        }
      }, intervalMs);
      logger.info(`[Scraper] Automatic job scheduler initialized at interval: ${config.scrapeInterval} min.`);
    }
  } catch (err) {
    logger.error(`[Scraper] Scheduler initialization error: ${err.message}`);
  }
};

// ─── GET /api/admin/scraper/status ────────────────────────────────
export const getScraperStatus = asyncHandler(async (req, res) => {
  let config = await ScraperConfig.findOne();
  if (!config) {
    config = await ScraperConfig.create({});
  }

  const payload = {
    config,
    schedulerRunning: Boolean(schedulerIntervalId),
  };

  return res
    .status(200)
    .json(new ApiResponse(200, payload, 'Scraper status retrieved successfully.'));
});

// ─── PATCH /api/admin/scraper/settings ────────────────────────────
export const updateScraperSettings = asyncHandler(async (req, res) => {
  const { scrapeInterval, maxJobs, keywords, country, remoteOnly, enabledSources } = req.body;

  let config = await ScraperConfig.findOne();
  if (!config) {
    config = new ScraperConfig();
  }

  if (scrapeInterval !== undefined) config.scrapeInterval = scrapeInterval;
  if (maxJobs !== undefined) config.maxJobs = maxJobs;
  if (keywords !== undefined) config.keywords = keywords;
  if (country !== undefined) config.country = country;
  if (remoteOnly !== undefined) config.remoteOnly = remoteOnly;
  if (enabledSources !== undefined) config.enabledSources = enabledSources;

  await config.save();
  await initScraperScheduler();

  return res
    .status(200)
    .json(new ApiResponse(200, { config }, 'Scraper settings updated successfully.'));
});

// ─── POST /api/admin/scraper/run ──────────────────────────────────
export const triggerManualScrape = asyncHandler(async (req, res) => {
  const config = await ScraperConfig.findOne();
  if (!config) {
    throw new ApiError(500, 'Scraper configurations not found.');
  }

  if (config.status === 'running') {
    throw new ApiError(400, 'Scraper task is already running.');
  }

  config.status = 'running';
  await config.save();

  runScrapeExecution(config, req.admin?._id || req.user?._id);

  return res
    .status(202)
    .json(new ApiResponse(202, null, 'Manual scraping task triggered successfully in the background.'));
});

// ─── POST /api/admin/scraper/pause ────────────────────────────────
export const pauseScraperScheduler = asyncHandler(async (req, res) => {
  const config = await ScraperConfig.findOne();
  if (config) {
    config.isActiveScheduler = false;
    await config.save();
  }

  if (schedulerIntervalId) {
    clearInterval(schedulerIntervalId);
    schedulerIntervalId = null;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { config }, 'Scraper scheduler paused successfully.'));
});

// ─── POST /api/admin/scraper/resume ───────────────────────────────
export const resumeScraperScheduler = asyncHandler(async (req, res) => {
  const config = await ScraperConfig.findOne();
  if (config) {
    config.isActiveScheduler = true;
    await config.save();
  }

  await initScraperScheduler();

  return res
    .status(200)
    .json(new ApiResponse(200, { config }, 'Scraper scheduler resumed successfully.'));
});

// ─── GET /api/admin/scraper/logs ──────────────────────────────────
export const getScraperLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    ScraperLog.find().sort('-startTime').skip(skip).limit(limit),
    ScraperLog.countDocuments(),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { logs, total, page, pages: Math.ceil(total / limit) },
      'Scraper logs retrieved successfully.'
    )
  );
});

export default {
  initScraperScheduler,
  getScraperStatus,
  updateScraperSettings,
  triggerManualScrape,
  pauseScraperScheduler,
  resumeScraperScheduler,
  getScraperLogs,
};
