import adzunaService from '../services/adzuna.service.js';
import Resume from '../models/Resume.model.js';
import { matchUserToJobs } from '../services/jobMatchService.js';
import { generateQuestionsDirect } from '../services/ai.service.js';
import jobSearchService from '../services/jobSearchService.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { JOB_MESSAGES } from '../constants/messages.constants.js';
import {
  formatSearchResponse,
  formatJobDetail,
  formatCategories,
} from '../utils/responseFormatter.js';
import logger from '../config/logger.js';

// ─── Search Jobs ──────────────────────────────────────────────────────────────
export const searchJobs = asyncHandler(async (req, res) => {
  const {
    q,
    what,
    where,
    country,
    page = 1,
    results = 20,
    category,
    contract,
    salaryMin,
    salaryMax,
    sortBy = 'relevance',
    sortDir = 'down',
  } = req.query;

  const data = await adzunaService.searchJobs({
    q,
    what,
    where,
    country,
    page: Number(page),
    results: Number(results),
    category,
    contract,
    salaryMin,
    salaryMax,
    sortBy,
    sortDir,
  });

  const formatted = formatSearchResponse({
    jobs: data.jobs,
    total: data.count,
    page: data.page,
    pagination: data.pagination,
    rawQuery: q || null,
    queryMeta: data.queryMeta,
    duplicatesRemoved: data.duplicatesRemoved,
    cacheInfo:
      process.env.NODE_ENV !== 'production' || data.isFallback
        ? { hit: data.cacheHit, fallback: data.isFallback }
        : undefined,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, formatted, JOB_MESSAGES.JOBS_FETCHED));
});

// ─── Get Single Job ───────────────────────────────────────────────────────────
export const getJobById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { country } = req.query;

  const job = await adzunaService.getJobById(id, country);
  if (!job) {
    throw new ApiError(404, JOB_MESSAGES.JOB_NOT_FOUND);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, formatJobDetail(job), JOB_MESSAGES.JOBS_FETCHED));
});

// ─── Get Categories ───────────────────────────────────────────────────────────
export const getCategories = asyncHandler(async (req, res) => {
  const { country } = req.query;
  const categories = await adzunaService.getCategories(country);

  return res
    .status(200)
    .json(new ApiResponse(200, formatCategories(categories), JOB_MESSAGES.CATEGORIES_FETCHED));
});

// ─── Get Recommended Jobs ─────────────────────────────────────────────────────
export const getRecommendedJobs = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  let resume = await Resume.findOne({ userId, isDefault: true }).lean();
  if (!resume) {
    resume = await Resume.findOne({ userId }).sort({ updatedAt: -1 }).lean();
  }

  if (!resume || !resume.parsedData || !Array.isArray(resume.parsedData.skills)) {
    return res.status(200).json(
      new ApiResponse(
        200,
        { results: [] },
        'Please upload and parse your resume to get personalized recommendations.'
      )
    );
  }

  const userSkills = resume.parsedData.skills;
  const recommendedJobs = await matchUserToJobs(userSkills);

  return res
    .status(200)
    .json(new ApiResponse(200, { results: recommendedJobs }, JOB_MESSAGES.RECOMMENDED_JOBS_FETCHED));
});

// ─── Generate Questions from Job Description ─────────────────────────────────
export const generateQuestionsFromDesc = asyncHandler(async (req, res) => {
  const { jobTitle, jobDescription } = req.body;

  if (!jobTitle || !jobDescription) {
    throw new ApiError(400, 'Job title and job description are required.');
  }

  const questions = await generateQuestionsDirect(jobTitle, jobDescription);

  return res
    .status(200)
    .json(new ApiResponse(200, { questions }, JOB_MESSAGES.QUESTIONS_GENERATED));
});

// ─── Database Active Jobs Search ──────────────────────────────────────────────
export const getJobs = asyncHandler(async (req, res) => {
  const result = await jobSearchService.searchJobs(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, result, JOB_MESSAGES.JOBS_FETCHED));
});

export const getActiveJobsList = getJobs;

export default {
  searchJobs,
  getJobById,
  getCategories,
  getRecommendedJobs,
  generateQuestionsFromDesc,
  getJobs,
  getActiveJobsList,
};
