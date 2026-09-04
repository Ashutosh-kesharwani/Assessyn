import { Router } from 'express';
import { query, param, body, validationResult } from 'express-validator';
import jobsController from '../controllers/jobs.controller.js';
import jobsCache from '../utils/jobsCache.js';
import { circuitBreaker } from '../utils/adzunaClient.js';
import { verifyJWT, protect } from '../middleware/index.js';

const router = Router();

// ─── Validation Middleware ─────────────────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

// ─── Search Validators ────────────────────────────────────────────────────────
const searchValidators = [
  query('q')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Natural-language query (q) is too long (max 500 chars)'),

  query('what')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Keyword too long'),

  query('where')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Location too long'),

  query('page')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('page must be between 1–50')
    .toInt(),

  query('results')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('results must be between 1–50')
    .toInt(),

  query('country')
    .optional()
    .isAlpha().withMessage('country must be a valid ISO alpha code')
    .isLength({ min: 2, max: 2 }).withMessage('country must be a 2-letter code'),

  query('sortBy')
    .optional()
    .isIn(['date', 'salary', 'relevance']).withMessage('sortBy must be date | salary | relevance'),

  query('sortDir')
    .optional()
    .isIn(['up', 'down']).withMessage('sortDir must be up | down'),

  query('salaryMin')
    .optional()
    .isInt({ min: 0 }).withMessage('salaryMin must be a positive integer')
    .toInt(),

  query('salaryMax')
    .optional()
    .isInt({ min: 0 }).withMessage('salaryMax must be a positive integer')
    .toInt(),

  query('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('category tag too long'),

  query('contract')
    .optional()
    .isIn(['full_time', 'part_time', 'contract', 'permanent'])
    .withMessage('contract must be full_time | part_time | contract | permanent'),
];

// ─── Routes ───────────────────────────────────────────────────────────────────
router.get(
  '/search',
  searchValidators,
  validate,
  jobsController.searchJobs
);

router.get(
  '/categories',
  [
    query('country')
      .optional()
      .isAlpha()
      .isLength({ min: 2, max: 2 }),
  ],
  validate,
  jobsController.getCategories
);

router.get(
  '/recommended',
  verifyJWT,
  jobsController.getRecommendedJobs
);

router.post(
  '/generate-questions',
  verifyJWT,
  [
    body('jobTitle').trim().notEmpty().withMessage('Job title is required'),
    body('jobDescription').trim().notEmpty().withMessage('Job description is required'),
  ],
  validate,
  jobsController.generateQuestionsFromDesc
);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('keyword').optional().trim().isString(),
    query('location').optional().trim().isString(),
    query('category').optional().trim().isString(),
    query('contractType').optional().trim().isString(),
    query('salaryMin').optional().trim().isNumeric().withMessage('salaryMin must be a numeric value'),
  ],
  validate,
  jobsController.getActiveJobsList
);

router.get('/cache-stats', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }

  const [cacheStats] = await Promise.all([
    jobsCache.stats(),
  ]);

  res.status(200).json({
    success: true,
    cache: {
      ...cacheStats,
      searchTtlLabel: `${jobsCache.SEARCH_TTL_S}s (${jobsCache.SEARCH_TTL_S / 60} min)`,
      detailTtlLabel: `${jobsCache.DETAIL_TTL_S}s (${jobsCache.DETAIL_TTL_S / 60} min)`,
      keyFormat: {
        search: 'jobs:{sha256(params)}:page:{page}',
        detail: 'job:{job_id}',
      },
    },
    circuitBreaker: circuitBreaker.snapshot(),
  });
});

router.get(
  '/:id',
  [
    param('id')
      .notEmpty().withMessage('Job id is required')
      .isNumeric().withMessage('Job id must be numeric'),
    query('country')
      .optional()
      .isAlpha()
      .isLength({ min: 2, max: 2 }),
  ],
  validate,
  jobsController.getJobById
);

export default router;
