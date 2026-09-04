import userService from '../services/user.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { USER_MESSAGES, AUTH_MESSAGES } from '../constants/messages.constants.js';

// ─── GET /api/users/me ─────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  const profile = await userService.getMe(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, profile, USER_MESSAGES.CURRENT_USER_FETCHED));
});

// ─── PATCH /api/users/me ───────────────────────────────────────────
export const updateMe = asyncHandler(async (req, res) => {
  const profile = await userService.updateMe(req.user._id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, profile, USER_MESSAGES.PROFILE_UPDATED));
});

// ─── GET /api/users/username/:username/availability ────────────────
export const checkUsernameAvailability = asyncHandler(async (req, res) => {
  const result = await userService.checkUsernameAvailability(req.params.username);
  return res
    .status(200)
    .json(new ApiResponse(200, { available: result.available, username: result.username }, result.message));
});

// ─── POST /api/users/me/email/verify-update ────────────────────────
export const verifyUpdateEmail = asyncHandler(async (req, res) => {
  const profile = await userService.verifyUpdateEmail(req.user._id, req.body.idToken);
  return res
    .status(200)
    .json(new ApiResponse(200, profile, USER_MESSAGES.EMAIL_UPDATED));
});

// ─── POST /api/users/me/phone/verify-update ────────────────────────
export const verifyUpdatePhone = asyncHandler(async (req, res) => {
  const profile = await userService.verifyUpdatePhone(
    req.user._id,
    req.body.idToken,
    req.body.phoneNumber
  );
  return res
    .status(200)
    .json(new ApiResponse(200, profile, USER_MESSAGES.MOBILE_UPDATED));
});

// ─── GET /api/users/profile ───────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, profile, USER_MESSAGES.CURRENT_USER_FETCHED));
});

// ─── PUT /api/users/profile ───────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await userService.updateProfile(req.user._id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, profile, USER_MESSAGES.PROFILE_UPDATED));
});

// ─── POST /api/users/avatar ───────────────────────────────────────
export const uploadAvatar = asyncHandler(async (req, res) => {
  const profile = await userService.uploadAvatar(req.user._id, req.file, req.body?.avatar);
  return res
    .status(200)
    .json(new ApiResponse(200, profile, USER_MESSAGES.AVATAR_UPLOADED));
});

// ─── DELETE /api/users/avatar ─────────────────────────────────────
export const deleteAvatar = asyncHandler(async (req, res) => {
  const profile = await userService.deleteAvatar(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, profile, USER_MESSAGES.AVATAR_DELETED));
});

// ─── PUT /api/users/change-password ───────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const profile = await userService.changePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword
  );
  return res
    .status(200)
    .json(new ApiResponse(200, profile, AUTH_MESSAGES.PASSWORD_CHANGED));
});

// ─── GET /api/users/dashboard ─────────────────────────────────────
export const getDashboard = asyncHandler(async (req, res) => {
  const dashboardData = await userService.getDashboard(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, dashboardData, USER_MESSAGES.DASHBOARD_FETCHED));
});

export default {
  getMe,
  updateMe,
  checkUsernameAvailability,
  verifyUpdateEmail,
  verifyUpdatePhone,
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  getDashboard,
};
