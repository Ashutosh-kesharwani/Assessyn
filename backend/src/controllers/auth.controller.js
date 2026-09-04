import { validationResult } from 'express-validator';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { AUTH_MESSAGES } from '../constants/auth.constants.js';
import { verifyFirebaseIdToken } from '../config/firebaseAdmin.js';
import { setAuthCookies, clearAuthCookies } from '../utils/cookie.util.js';
import {
  getSafeUser,
  generateAccessAndRefreshToken,
  verifyRefreshToken,
  generateUniqueUsername,
} from '../services/auth.service.js';
import logger from '../config/logger.js';

const ADMIN_EMAIL = 'admin@gmail.com';

// ─── POST /api/auth/register ───────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  logger.info(`[Auth] Register request received for email: ${req.body?.email}`);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  const { name, email, password, username, firstName, lastName, phone, mobile } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  let finalUsername = username ? User.normalizeUsername(username) : null;
  if (finalUsername) {
    const existingUsername = await User.findOne({ username: finalUsername });
    if (existingUsername) {
      throw new ApiError(409, 'This username is already taken.');
    }
  } else {
    finalUsername = await generateUniqueUsername(name || email.split('@')[0], Date.now().toString());
  }

  const role = email.toLowerCase() === ADMIN_EMAIL ? 'super_admin' : 'candidate';
  const finalPhone = mobile || phone || undefined;

  const user = await User.create({
    name: name || `${firstName || ''} ${lastName || ''}`.trim() || 'Shinobi Candidate',
    firstName: firstName || '',
    lastName: lastName || '',
    email: email.toLowerCase(),
    phone: finalPhone,
    mobile: finalPhone,
    password,
    username: finalUsername,
    role,
    authProvider: 'password',
    emailVerified: false,
    phoneVerified: false,
    lastLoginAt: new Date(),
    lastLogin: new Date(),
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  const safeUser = await getSafeUser(user._id);

  setAuthCookies(res, accessToken, refreshToken);

  logger.info(`[Auth] User registered successfully: ${user._id} (${user.email})`);

  return res.status(201).json(
    new ApiResponse(
      201,
      { user: safeUser, accessToken, refreshToken },
      AUTH_MESSAGES.REGISTRATION_SUCCESS
    )
  );
});

// ─── POST /api/auth/login ─────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  logger.info(`[Auth] Login attempt for email: ${req.body?.email}`);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isActive) {
    throw new ApiError(403, AUTH_MESSAGES.ACCOUNT_DEACTIVATED);
  }

  if (user.isBanned) {
    throw new ApiError(403, AUTH_MESSAGES.ACCOUNT_BANNED);
  }

  if (email.toLowerCase() === ADMIN_EMAIL && user.role !== 'super_admin') {
    user.role = 'super_admin';
    await user.save({ validateBeforeSave: false });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  const safeUser = await getSafeUser(user._id);

  setAuthCookies(res, accessToken, refreshToken);

  logger.info(`[Auth] User authenticated successfully: ${user._id} (${user.email})`);

  return res.status(200).json(
    new ApiResponse(
      200,
      { user: safeUser, accessToken, refreshToken },
      AUTH_MESSAGES.LOGIN_SUCCESS
    )
  );
});

// ─── POST /api/auth/firebase-login (Google OAuth & Mobile Phone SMS) ──
export const firebaseLogin = asyncHandler(async (req, res) => {
  const firebaseIdToken =
    req.body?.firebaseIdToken ||
    req.body?.idToken ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

  if (!firebaseIdToken) {
    throw new ApiError(400, AUTH_MESSAGES.FIREBASE_TOKEN_REQUIRED);
  }

  let decodedToken;
  try {
    decodedToken = await verifyFirebaseIdToken(firebaseIdToken);
  } catch (err) {
    logger.error(`[Auth] Firebase token verification failed: ${err.message}`);
    throw new ApiError(401, AUTH_MESSAGES.FIREBASE_AUTH_FAILED);
  }

  const {
    uid: firebaseUid,
    email,
    email_verified: emailVerified,
    phone_number: phone,
    name,
    picture: photoUrl,
    firebase,
  } = decodedToken;

  const finalPhone = phone || req.body?.phoneNumber || req.body?.phone || req.body?.mobile;
  const signInProvider = firebase?.sign_in_provider || (finalPhone ? 'phone' : 'google');

  let authProvider = 'google';
  if (signInProvider.includes('phone') || finalPhone) authProvider = 'phone';
  else if (signInProvider.includes('password')) authProvider = 'password';

  // 1. Find by firebaseUid
  let user = await User.findOne({ firebaseUid });

  // 2. Link account by verified email or phone if not found by firebaseUid
  if (!user && email && emailVerified) {
    user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      user.firebaseUid = firebaseUid;
      user.emailVerified = true;
    }
  } else if (!user && finalPhone) {
    user = await User.findOne({
      $or: [{ phone: finalPhone }, { mobile: finalPhone }],
    });
    if (user) {
      user.firebaseUid = firebaseUid;
      user.phoneVerified = true;
    }
  }

  // 3. Create new user if not found
  let statusCode = 200;
  if (!user) {
    statusCode = 201;
    const displayName =
      name ||
      req.body?.name ||
      (email ? email.split('@')[0] : finalPhone ? `Shinobi (${finalPhone.slice(-4)})` : 'Shinobi Candidate');
    const generatedUsername = await generateUniqueUsername(displayName, firebaseUid);
    const isSuperAdmin = email && email.toLowerCase() === ADMIN_EMAIL;

    user = new User({
      firebaseUid,
      username: generatedUsername,
      name: displayName,
      email: email ? email.toLowerCase() : undefined,
      phone: finalPhone || undefined,
      mobile: finalPhone || undefined,
      emailVerified: Boolean(emailVerified),
      phoneVerified: Boolean(finalPhone),
      photoUrl: photoUrl || undefined,
      avatar: photoUrl || 'archetype_blade',
      authProvider,
      role: isSuperAdmin ? 'super_admin' : 'candidate',
      isActive: true,
      lastLoginAt: new Date(),
      lastLogin: new Date(),
    });
  } else {
    // Synchronize verified identity claims
    if (email && emailVerified) {
      user.email = email.toLowerCase();
      user.emailVerified = true;
    }
    if (finalPhone) {
      user.phone = finalPhone;
      user.mobile = finalPhone;
      user.phoneVerified = true;
    }
    if (photoUrl) {
      user.photoUrl = photoUrl;
      if (!user.avatar || user.avatar === 'archetype_blade') {
        user.avatar = photoUrl;
      }
    }
    if (!user.username) {
      user.username = await generateUniqueUsername(user.name || 'shinobi', firebaseUid);
    }
    user.lastLoginAt = new Date();
    user.lastLogin = new Date();
  }

  if (!user.isActive) {
    throw new ApiError(403, AUTH_MESSAGES.ACCOUNT_DEACTIVATED);
  }

  if (user.isBanned) {
    throw new ApiError(403, AUTH_MESSAGES.ACCOUNT_BANNED);
  }

  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  const safeUser = await getSafeUser(user._id);

  setAuthCookies(res, accessToken, refreshToken);

  logger.info(`[Auth] Firebase login success for: ${user._id} (${user.email || user.phone}) via ${authProvider}`);

  return res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      { user: safeUser, accessToken, refreshToken },
      AUTH_MESSAGES.LOGIN_SUCCESS
    )
  );
});

// Backward compatibility alias for legacy route
export const syncFirebaseAuth = firebaseLogin;

// ─── POST /api/auth/refresh-token ──────────────────────────────────
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken ||
    req.body?.refreshToken ||
    req.header('Authorization')?.replace('Bearer ', '');

  if (!incomingRefreshToken) {
    throw new ApiError(401, AUTH_MESSAGES.REFRESH_TOKEN_EXPIRED);
  }

  try {
    const user = await verifyRefreshToken(incomingRefreshToken);
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const safeUser = await getSafeUser(user._id);

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json(
      new ApiResponse(
        200,
        { user: safeUser, accessToken, refreshToken },
        AUTH_MESSAGES.TOKEN_REFRESHED
      )
    );
  } catch (error) {
    clearAuthCookies(res);
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, AUTH_MESSAGES.REFRESH_TOKEN_EXPIRED);
    }
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }
    throw error;
  }
});

// Backward compatibility alias
export const refreshToken = refreshAccessToken;

// ─── GET /api/auth/me ─────────────────────────────────────────────
export const getCurrentUser = asyncHandler(async (req, res) => {
  // req.user is set by verifyJWT middleware
  const safeUser = await getSafeUser(req.user._id);
  return res.status(200).json(
    new ApiResponse(200, { user: safeUser || req.user }, 'User profile retrieved successfully')
  );
});

// Backward compatibility alias
export const getMe = getCurrentUser;

// ─── POST /api/auth/logout ────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, {
      $set: { refreshToken: null },
    });
  }

  clearAuthCookies(res);

  return res.status(200).json(
    new ApiResponse(200, null, AUTH_MESSAGES.LOGOUT_SUCCESS)
  );
});

// ─── POST /api/auth/resolve-username ──────────────────────────────
export const resolveUsername = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) {
    throw new ApiError(400, 'Username is required.');
  }

  const normalized = User.normalizeUsername(username);
  const user = await User.findOne({ username: normalized }).select('email isActive isBanned');

  if (!user || !user.isActive || user.isBanned) {
    throw new ApiError(404, 'Invalid credentials or user not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, { email: user.email }, 'Username resolved successfully')
  );
});

export default {
  register,
  login,
  firebaseLogin,
  syncFirebaseAuth,
  refreshAccessToken,
  refreshToken,
  getCurrentUser,
  getMe,
  logout,
  resolveUsername,
};
