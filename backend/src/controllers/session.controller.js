import sessionService from '../services/session.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { SESSION_MESSAGES } from '../constants/messages.constants.js';

// ─── POST /api/sessions/start ─────────────────────────────────────
export const startSession = asyncHandler(async (req, res) => {
  const result = await sessionService.startSession(req.user._id, req.body.interviewId);
  const status = result.resumed ? 200 : 201;
  return res
    .status(status)
    .json(new ApiResponse(status, result, SESSION_MESSAGES.SESSION_STARTED));
});

// ─── POST /api/sessions/:id/answer ────────────────────────────────
export const submitAnswer = asyncHandler(async (req, res) => {
  const session = await sessionService.submitAnswer(
    req.user._id,
    req.params.id,
    req.body
  );
  return res
    .status(200)
    .json(new ApiResponse(200, { session }, SESSION_MESSAGES.ANSWER_SUBMITTED));
});

// ─── POST /api/sessions/:id/complete ─────────────────────────────
export const completeSession = asyncHandler(async (req, res) => {
  const session = await sessionService.completeSession(req.user._id, req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, { session }, SESSION_MESSAGES.SESSION_COMPLETED));
});

// ─── GET /api/sessions ────────────────────────────────────────────
export const getMySessions = asyncHandler(async (req, res) => {
  const payload = await sessionService.getMySessions(
    req.user._id,
    req.query.page,
    req.query.limit
  );
  return res
    .status(200)
    .json(new ApiResponse(200, payload, SESSION_MESSAGES.SESSIONS_FETCHED));
});

// ─── GET /api/sessions/:id ────────────────────────────────────────
export const getSessionById = asyncHandler(async (req, res) => {
  const session = await sessionService.getSessionById(req.user._id, req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, { session }, SESSION_MESSAGES.SESSIONS_FETCHED));
});

export default {
  startSession,
  submitAnswer,
  completeSession,
  getMySessions,
  getSessionById,
};
