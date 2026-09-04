import {
  restructureResumeWithAI,
  generateTailoredProjectsWithAI,
  generateTargetedQuestionBankWithAI,
  generateCareerRoadmapWithAI,
  chatWithProAdvisor,
  getRadarJobsFromDB,
} from '../services/proCareer.service.js';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { PRO_MESSAGES, USER_MESSAGES } from '../constants/messages.constants.js';
import logger from '../config/logger.js';

// ─── PUT /api/pro/api-keys (Backward Compatibility) ────────────────
export const saveUserApiKeys = asyncHandler(async (req, res) => {
  const { models } = req.body;
  if (!Array.isArray(models)) {
    throw new ApiError(400, 'Models array is required.');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, USER_MESSAGES.USER_NOT_FOUND);
  }

  user.customApiKeys = models.map((m, idx) => ({
    provider: m.provider || m.id,
    apiKey: m.apiKey || '',
    isActive: m.isActive !== undefined ? m.isActive : true,
    priority: m.priority || idx + 1,
  }));

  await user.save();
  logger.info(`[Pro] API keys saved for user: ${user._id}`);

  return res
    .status(200)
    .json(new ApiResponse(200, { customApiKeys: user.customApiKeys }, PRO_MESSAGES.API_KEYS_SAVED));
});

// ─── GET /api/pro/api-keys (Backward Compatibility) ────────────────
export const getUserApiKeys = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('customApiKeys isPremium');
  if (!user) {
    throw new ApiError(404, USER_MESSAGES.USER_NOT_FOUND);
  }

  const maskedKeys = (user.customApiKeys || []).map((k) => ({
    provider: k.provider,
    isActive: k.isActive,
    priority: k.priority,
    apiKeyMasked: k.apiKey
      ? `${k.apiKey.substring(0, 6)}••••••••${k.apiKey.slice(-4)}`
      : '',
    hasKey: !!k.apiKey,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      { customApiKeys: maskedKeys, isPremium: user.isPremium },
      PRO_MESSAGES.API_KEYS_FETCHED
    )
  );
});

// ─── POST /api/pro/resume-restructure ─────────────────────────────
export const restructureResumeController = asyncHandler(async (req, res) => {
  const { resumeId, resumeText, jobDescription } = req.body;
  if (!jobDescription || (!resumeText && !resumeId)) {
    throw new ApiError(400, 'Job description and candidate resume (or resumeId) are required.');
  }

  try {
    const result = await restructureResumeWithAI({
      userId: req.user?._id,
      resumeId,
      resumeText,
      jobDescription,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, result, PRO_MESSAGES.RESUME_RESTRUCTURED));
  } catch (err) {
    logger.error(`[Pro] Restructure resume error: ${err.message}`);
    throw new ApiError(500, err.message || 'Failed to restructure resume.');
  }
});

// ─── POST /api/pro/projects ───────────────────────────────────────
export const generateProjectsController = asyncHandler(async (req, res) => {
  const { resumeId, resumeText, jobDescription } = req.body;
  if (!jobDescription) {
    throw new ApiError(400, 'jobDescription is required.');
  }

  try {
    const result = await generateTailoredProjectsWithAI({
      userId: req.user?._id,
      resumeId,
      resumeText,
      jobDescription,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, result, PRO_MESSAGES.PROJECTS_GENERATED));
  } catch (err) {
    logger.error(`[Pro] Generate projects error: ${err.message}`);
    throw new ApiError(500, err.message || 'Failed to generate tailored projects.');
  }
});

// ─── POST /api/pro/questions ──────────────────────────────────────
export const generateQuestionBankController = asyncHandler(async (req, res) => {
  const { resumeId, resumeText, jobDescription, experienceLevel, questionCount } = req.body;
  if (!jobDescription) {
    throw new ApiError(400, 'jobDescription is required.');
  }

  try {
    const result = await generateTargetedQuestionBankWithAI({
      userId: req.user?._id,
      resumeId,
      resumeText,
      jobDescription,
      experienceLevel: experienceLevel || 'Mid-Senior',
      questionCount: questionCount || 6,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, result, PRO_MESSAGES.QUESTIONS_GENERATED));
  } catch (err) {
    logger.error(`[Pro] Generate question bank error: ${err.message}`);
    throw new ApiError(500, err.message || 'Failed to generate question bank.');
  }
});

// ─── POST /api/pro/roadmap ────────────────────────────────────────
export const generateRoadmapController = asyncHandler(async (req, res) => {
  const { resumeId, currentSkills, targetRole, jobDescription, durationDays } = req.body;
  if (!targetRole) {
    throw new ApiError(400, 'targetRole is required.');
  }

  try {
    const result = await generateCareerRoadmapWithAI({
      userId: req.user?._id,
      resumeId,
      currentSkills: currentSkills || '',
      targetRole,
      jobDescription: jobDescription || '',
      durationDays: durationDays || 30,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, result, PRO_MESSAGES.ROADMAP_GENERATED));
  } catch (err) {
    logger.error(`[Pro] Generate roadmap error: ${err.message}`);
    throw new ApiError(500, err.message || 'Failed to generate career roadmap.');
  }
});

// ─── POST /api/pro/chat ───────────────────────────────────────────
export const proChatController = asyncHandler(async (req, res) => {
  const { toolType, toolContext, conversationHistory, message } = req.body;
  if (!message || !message.trim()) {
    throw new ApiError(400, 'Message is required.');
  }

  try {
    const result = await chatWithProAdvisor({
      toolType: toolType || 'Career Preparation',
      toolContext: toolContext || {},
      conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : [],
      message,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, result, 'Advisory response generated successfully.'));
  } catch (err) {
    logger.error(`[Pro] Chat advisor error: ${err.message}`);
    throw new ApiError(500, err.message || 'Failed to generate advisory response.');
  }
});

// ─── GET /api/pro/radar-jobs ──────────────────────────────────────
export const getRadarJobsController = asyncHandler(async (req, res) => {
  try {
    const jobs = await getRadarJobsFromDB(req.query);
    return res
      .status(200)
      .json(new ApiResponse(200, jobs, PRO_MESSAGES.RADAR_JOBS_FETCHED));
  } catch (err) {
    logger.error(`[Pro] Radar jobs error: ${err.message}`);
    throw new ApiError(500, err.message || 'Failed to retrieve radar jobs.');
  }
});

export default {
  saveUserApiKeys,
  getUserApiKeys,
  restructureResumeController,
  generateProjectsController,
  generateQuestionBankController,
  generateRoadmapController,
  proChatController,
  getRadarJobsController,
};
