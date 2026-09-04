import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { AUTH_MESSAGES } from '../constants/messages.constants.js';
import { setAuthCookies, clearAuthCookies } from '../utils/cookie.util.js';
import { generateAccessAndRefreshToken, verifyRefreshToken } from '../services/auth.service.js';
import { getRolePermissions } from '../middleware/index.js';
import logger from '../config/logger.js';

const SUPER_ADMIN_EMAILS = [
  'admin@gmail.com',
  (process.env.ADMIN_EMAIL || '').toLowerCase(),
].filter(Boolean);
const ADMIN_ROLES = ['admin', 'super_admin', 'support', 'content_manager'];

const formatAdminPayload = (user, accessToken, refreshToken) => ({
  accessToken,
  refreshToken,
  admin: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: getRolePermissions(user.role),
    avatar: typeof user.avatar === 'object' ? user.avatar?.url : user.avatar || user.photoUrl || null,
    lastLogin: user.lastLogin || user.lastLoginAt,
    createdAt: user.createdAt,
  },
});

// ─── POST /api/admin/auth/login ───────────────────────────────────
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, AUTH_MESSAGES.ADMIN_INVALID_CREDENTIALS);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, AUTH_MESSAGES.ADMIN_INVALID_CREDENTIALS);
  }

  if (!ADMIN_ROLES.includes(user.role)) {
    throw new ApiError(403, AUTH_MESSAGES.FORBIDDEN);
  }

  if (!user.isActive) {
    throw new ApiError(403, AUTH_MESSAGES.ACCOUNT_DEACTIVATED);
  }

  if (user.isBanned) {
    throw new ApiError(403, AUTH_MESSAGES.ACCOUNT_BANNED);
  }

  if (SUPER_ADMIN_EMAILS.includes(user.email) && user.role !== 'super_admin') {
    user.role = 'super_admin';
  }

  user.lastLogin = new Date();
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  setAuthCookies(res, accessToken, refreshToken);

  logger.info(`[AdminAuth] Admin logged in: ${user._id} (${user.email}) [${user.role}]`);

  return res.status(200).json(
    new ApiResponse(
      200,
      formatAdminPayload(user, accessToken, refreshToken),
      AUTH_MESSAGES.LOGIN_SUCCESS
    )
  );
});

// ─── POST /api/admin/auth/logout ─────────────────────────────────
export const adminLogout = asyncHandler(async (req, res) => {
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: null } });
  }

  clearAuthCookies(res);

  return res
    .status(200)
    .json(new ApiResponse(200, null, AUTH_MESSAGES.LOGOUT_SUCCESS));
});

// ─── POST /api/admin/auth/refresh ────────────────────────────────
export const adminRefreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken ||
    req.body?.refreshToken ||
    req.header('Authorization')?.replace('Bearer ', '');

  if (!incomingRefreshToken) {
    throw new ApiError(401, AUTH_MESSAGES.REFRESH_TOKEN_EXPIRED);
  }

  const user = await verifyRefreshToken(incomingRefreshToken);

  if (!ADMIN_ROLES.includes(user.role)) {
    throw new ApiError(403, AUTH_MESSAGES.FORBIDDEN);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  setAuthCookies(res, accessToken, refreshToken);

  return res.status(200).json(
    new ApiResponse(
      200,
      formatAdminPayload(user, accessToken, refreshToken),
      AUTH_MESSAGES.TOKEN_REFRESHED
    )
  );
});

// ─── GET /api/admin/auth/me ───────────────────────────────────────
export const getAdminMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.admin?._id || req.user?._id);
  if (!user) {
    throw new ApiError(404, 'Admin profile not found.');
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        admin: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: getRolePermissions(user.role),
          avatar: typeof user.avatar === 'object' ? user.avatar?.url : user.avatar || user.photoUrl || null,
          lastLogin: user.lastLogin || user.lastLoginAt,
          createdAt: user.createdAt,
        },
      },
      'Admin profile retrieved successfully.'
    )
  );
});

export default {
  adminLogin,
  adminLogout,
  adminRefreshToken,
  getAdminMe,
};
