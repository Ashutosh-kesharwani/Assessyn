import interviewService from '../services/interview.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { INTERVIEW_MESSAGES } from '../constants/messages.constants.js';

// ─── POST /api/interviews ─────────────────────────────────────────
export const createInterview = asyncHandler(async (req, res) => {
  const interview = await interviewService.createInterview(req.user._id, req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, { interview }, INTERVIEW_MESSAGES.INTERVIEW_CREATED));
});

// ─── POST /api/interviews/:id/generate ────────────────────────────
export const generateQuestions = asyncHandler(async (req, res) => {
  const interview = await interviewService.generateQuestions(req.user._id, req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, { interview }, INTERVIEW_MESSAGES.QUESTIONS_GENERATED));
});

// ─── GET /api/interviews ──────────────────────────────────────────
export const getMyInterviews = asyncHandler(async (req, res) => {
  const payload = await interviewService.getMyInterviews(
    req.user._id,
    req.query.page,
    req.query.limit
  );
  return res
    .status(200)
    .json(new ApiResponse(200, payload, INTERVIEW_MESSAGES.INTERVIEWS_FETCHED));
});

// ─── GET /api/interviews/:id ──────────────────────────────────────
export const getInterviewById = asyncHandler(async (req, res) => {
  const interview = await interviewService.getInterviewById(req.user._id, req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, { interview }, INTERVIEW_MESSAGES.INTERVIEWS_FETCHED));
});

// ─── DELETE /api/interviews/:id ───────────────────────────────────
export const deleteInterview = asyncHandler(async (req, res) => {
  await interviewService.deleteInterview(req.user._id, req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, INTERVIEW_MESSAGES.INTERVIEW_DELETED));
});

export default {
  createInterview,
  generateQuestions,
  getMyInterviews,
  getInterviewById,
  deleteInterview,
};
