import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import { AUTH_MESSAGES } from '../constants/auth.constants.js';
import { verifyFirebaseIdToken } from '../config/firebaseAdmin.js';
import logger from '../config/logger.js';

/**
 * Pure Firebase ID token verification middleware.
 * Verifies Authorization: Bearer <firebase-id-token>
 * Attaches verified claims to req.firebaseUser and (if found) MongoDB user to req.user.
 */
export const firebaseAuthMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Authentication required. Missing Bearer token.'));
  }

  try {
    const decodedFirebaseToken = await verifyFirebaseIdToken(token);
    req.firebaseUser = decodedFirebaseToken;

    // Attach corresponding MongoDB user if present
    const user = await User.findOne({ firebaseUid: decodedFirebaseToken.uid });
    if (user) {
      if (!user.isActive) {
        return next(new ApiError(403, 'Your account has been deactivated. Contact support.'));
      }
      if (user.isBanned) {
        return next(new ApiError(403, 'Your account has been banned due to violation of terms.'));
      }
      req.user = user;
    }

    next();
  } catch (err) {
    if (err.code === 'auth/id-token-expired') {
      return next(new ApiError(401, 'Firebase authentication token has expired. Please sign in again.'));
    }
    if (err.code === 'auth/argument-error' || err.code === 'auth/invalid-id-token') {
      return next(new ApiError(401, 'Invalid Firebase authentication token.'));
    }
    return next(new ApiError(401, err.message || 'Firebase token verification failed.'));
  }
};

/**
 * Standard JWT verification middleware.
 * Extracts token from HttpOnly cookies (accessToken) or Authorization Bearer header.
 * Validates JWT, fetches active safe user, and attaches to req.user.
 */
export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '') ||
      req.header('authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, AUTH_MESSAGES.UNAUTHORIZED);
    }

    const secret = process.env.ACCESS_TOKEN_SECRET_KEY;
    let decodedToken;

    try {
      decodedToken = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, AUTH_MESSAGES.ACCESS_TOKEN_EXPIRED);
      }
      throw new ApiError(401, AUTH_MESSAGES.INVALID_ACCESS_TOKEN);
    }

    const userId = decodedToken._id || decodedToken.id;
    const user = await User.findById(userId).select('-password -refreshToken');

    if (!user) {
      throw new ApiError(401, AUTH_MESSAGES.INVALID_ACCESS_TOKEN);
    }

    if (!user.isActive || user.isBanned) {
      throw new ApiError(403, AUTH_MESSAGES.ACCOUNT_DEACTIVATED);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Backward compatibility alias for verifyJWT
 */
export const protect = verifyJWT;

/**
 * Restrict to Roles (Authorization)
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };
};

export default verifyJWT;
