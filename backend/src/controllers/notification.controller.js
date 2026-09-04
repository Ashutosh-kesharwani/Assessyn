import notificationService from '../services/notification.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { NOTIFICATION_MESSAGES } from '../constants/messages.constants.js';

// ─── CANDIDATE / USER ENDPOINTS ──────────────────────────────────────

// GET /api/notifications
export const getUserNotifications = asyncHandler(async (req, res) => {
  const data = await notificationService.getUserNotifications(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, data, NOTIFICATION_MESSAGES.NOTIFICATIONS_FETCHED));
});

// PATCH /api/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAsRead(req.user._id, req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, NOTIFICATION_MESSAGES.NOTIFICATION_MARKED_READ));
});

// POST /api/notifications/mark-all-read
export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, NOTIFICATION_MESSAGES.ALL_MARKED_READ));
});

// DELETE /api/notifications/:id/dismiss
export const dismissForUser = asyncHandler(async (req, res) => {
  const result = await notificationService.dismissForUser(req.user._id, req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, result, NOTIFICATION_MESSAGES.NOTIFICATION_DISMISSED));
});

// ─── ADMIN BROADCAST MANAGEMENT ENDPOINTS ─────────────────────────────

// GET /api/admin/notifications
export const getAdminNotifications = asyncHandler(async (req, res) => {
  const data = await notificationService.getAdminNotifications(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, data, NOTIFICATION_MESSAGES.NOTIFICATIONS_FETCHED));
});

// POST /api/admin/notifications
export const createBroadcast = asyncHandler(async (req, res) => {
  const adminId = req.admin?._id || req.user?._id;
  const notification = await notificationService.createBroadcast(adminId, req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, { notification }, 'Global announcement published successfully.'));
});

// PATCH /api/admin/notifications/:id
export const updateBroadcast = asyncHandler(async (req, res) => {
  const notification = await notificationService.updateBroadcast(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, { notification }, 'Broadcast updated successfully.'));
});

// DELETE /api/admin/notifications/:id
export const deleteBroadcast = asyncHandler(async (req, res) => {
  await notificationService.deleteBroadcast(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, { notificationId: req.params.id }, NOTIFICATION_MESSAGES.NOTIFICATION_DISMISSED));
});

export default {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  dismissForUser,
  getAdminNotifications,
  createBroadcast,
  updateBroadcast,
  deleteBroadcast,
};
