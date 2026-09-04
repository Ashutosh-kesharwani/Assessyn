import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import { AUTH_MESSAGES } from '../constants/auth.constants.js';
import logger from '../config/logger.js';

export const getSafeUser = async (userId) => {
  return User.findById(userId).select('-password -refreshToken');
};

export const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId).select('+refreshToken');
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Invalidate previous refresh session and set new refresh token
  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
  };
};

export const verifyRefreshToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new ApiError(401, AUTH_MESSAGES.REFRESH_TOKEN_EXPIRED);
  }

  const secret = process.env.REFRESH_TOKEN_SECRET_KEY;
  const decoded = jwt.verify(incomingRefreshToken, secret);

  const user = await User.findById(decoded._id).select('+refreshToken');

  if (!user || !user.isActive || user.isBanned || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
  }

  return user;
};

/**
 * Generate a unique shinobi username from name/email/phone
 */
export const generateUniqueUsername = async (baseName, uid) => {
  let cleanBase = (baseName || 'shinobi')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 15);

  if (cleanBase.length < 3) cleanBase = 'shinobi';

  let candidateUsername = cleanBase;
  let userExists = await User.findOne({ username: candidateUsername });

  if (!userExists) return candidateUsername;

  const suffix = (uid || Math.random().toString(36)).slice(-4).toLowerCase().replace(/[^a-z0-9]/g, 'x');
  candidateUsername = `${cleanBase}_${suffix}`.slice(0, 30);
  userExists = await User.findOne({ username: candidateUsername });

  if (!userExists) return candidateUsername;

  return `${cleanBase}_${Date.now().toString(36).slice(-4)}`.slice(0, 30);
};

export default {
  getSafeUser,
  generateAccessAndRefreshToken,
  verifyRefreshToken,
  generateUniqueUsername,
};
