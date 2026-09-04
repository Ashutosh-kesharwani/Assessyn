import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import { AUTH_MESSAGES } from '../constants/messages.constants.js';

const ADMIN_ROLES = ['admin', 'super_admin'];

// ─── protectAdmin ─────────────────────────────────────────────────
export const protectAdmin = async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer ', '') ||
    req.header('authorization')?.replace('Bearer ', '');

  if (!token) {
    return next(new ApiError(401, AUTH_MESSAGES.UNAUTHORIZED));
  }

  try {
    const secret = process.env.ACCESS_TOKEN_SECRET_KEY;
    let decoded;

    try {
      decoded = jwt.verify(token, secret);
    } catch {
      throw new ApiError(401, AUTH_MESSAGES.INVALID_ACCESS_TOKEN);
    }

    const userId = decoded._id || decoded.id;
    const user = await User.findById(userId).select('+passwordChangedAt');

    if (!user) {
      return next(new ApiError(401, 'The admin account no longer exists.'));
    }

    // Must hold an admin-level role
    if (!ADMIN_ROLES.includes(user.role)) {
      return next(new ApiError(403, AUTH_MESSAGES.FORBIDDEN));
    }

    if (!user.isActive) {
      return next(new ApiError(403, AUTH_MESSAGES.ACCOUNT_DEACTIVATED));
    }

    if (user.isBanned) {
      return next(new ApiError(403, AUTH_MESSAGES.ACCOUNT_BANNED));
    }

    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      return next(new ApiError(401, 'Password recently changed. Please log in again.'));
    }

    // Attach as req.admin AND req.user for compatibility with shared controllers
    req.admin = user;
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return next(new ApiError(401, AUTH_MESSAGES.INVALID_ACCESS_TOKEN));
    if (err.name === 'TokenExpiredError') return next(new ApiError(401, AUTH_MESSAGES.ACCESS_TOKEN_EXPIRED));
    return next(err);
  }
};

// ─── requireSuperAdmin ────────────────────────────────────────────
export const requireSuperAdmin = (req, res, next) => {
  if (req.admin?.role !== 'super_admin' && req.user?.role !== 'super_admin') {
    return next(new ApiError(403, 'This action requires Super Admin privileges.'));
  }
  next();
};

export default {
  protectAdmin,
  requireSuperAdmin,
};
