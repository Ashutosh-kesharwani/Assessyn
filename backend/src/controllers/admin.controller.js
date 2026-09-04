import adminService from '../services/admin.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import {
  ADMIN_MESSAGES,
  USER_MESSAGES,
  INTERVIEW_MESSAGES,
  SESSION_MESSAGES,
  RESUME_MESSAGES,
} from '../constants/messages.constants.js';

// ─── GET /api/admin/stats ──────────────────────────────────────────
export const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getStats();
  return res
    .status(200)
    .json(new ApiResponse(200, stats, ADMIN_MESSAGES.DASHBOARD_FETCHED));
});

// ─── GET /api/admin/users ──────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const data = await adminService.getAllUsers(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, data, ADMIN_MESSAGES.USERS_FETCHED));
});

// ─── GET /api/admin/users/:id ──────────────────────────────────────
export const getUserById = asyncHandler(async (req, res) => {
  const data = await adminService.getUserById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, data, USER_MESSAGES.CURRENT_USER_FETCHED));
});

// ─── PATCH /api/admin/users/:id ────────────────────────────────────
export const updateUser = asyncHandler(async (req, res) => {
  const user = await adminService.updateUser(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, { user }, ADMIN_MESSAGES.USER_STATUS_UPDATED));
});

// ─── POST /api/admin/users/bulk ────────────────────────────────────
export const bulkUserAction = asyncHandler(async (req, res) => {
  const result = await adminService.bulkUserAction(req.body.userIds, req.body.action);
  return res
    .status(200)
    .json(new ApiResponse(200, result, `Bulk ${req.body.action} operation completed successfully.`));
});

// ─── DELETE /api/admin/users/:id ───────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, 'User and all associated data deleted successfully.'));
});

// ─── GET /api/admin/interviews ─────────────────────────────────────
export const getAllInterviews = asyncHandler(async (req, res) => {
  const data = await adminService.getAllInterviews(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, data, INTERVIEW_MESSAGES.INTERVIEWS_FETCHED));
});

// ─── DELETE /api/admin/interviews/:id ──────────────────────────────
export const deleteInterview = asyncHandler(async (req, res) => {
  await adminService.deleteInterview(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, INTERVIEW_MESSAGES.INTERVIEW_DELETED));
});

// ─── GET /api/admin/sessions ───────────────────────────────────────
export const getAllSessions = asyncHandler(async (req, res) => {
  const data = await adminService.getAllSessions(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, data, SESSION_MESSAGES.SESSIONS_FETCHED));
});

// ─── DELETE /api/admin/sessions/:id ───────────────────────────────
export const deleteSession = asyncHandler(async (req, res) => {
  await adminService.deleteSession(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Session deleted successfully.'));
});

// ─── GET /api/admin/resumes ────────────────────────────────────────
export const getAllResumes = asyncHandler(async (req, res) => {
  const data = await adminService.getAllResumes(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, data, RESUME_MESSAGES.RESUMES_FETCHED));
});

// ─── DELETE /api/admin/resumes/:id ────────────────────────────────
export const deleteResume = asyncHandler(async (req, res) => {
  await adminService.deleteResume(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, RESUME_MESSAGES.RESUME_DELETED));
});

export default {
  getStats,
  getAllUsers,
  getUserById,
  updateUser,
  bulkUserAction,
  deleteUser,
  getAllInterviews,
  deleteInterview,
  getAllSessions,
  deleteSession,
  getAllResumes,
  deleteResume,
};
