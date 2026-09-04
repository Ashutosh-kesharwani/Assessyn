import User from '../models/User.model.js';
import Session from '../models/Session.model.js';
import ApiError from '../utils/ApiError.js';
import {
  USER_MESSAGES,
  AUTH_MESSAGES,
} from '../constants/messages.constants.js';
import cloudinary from '../config/cloudinary.js';
import { replaceMedia, removeMedia } from './media.service.js';
import { verifyFirebaseIdToken } from '../config/firebaseAdmin.js';
import logger from '../config/logger.js';

// ─── Helper: Format Clean Public Profile ──────────────────────────
export const formatUserProfile = (user) => {
  const avatarUrl =
    typeof user.avatar === 'object'
      ? user.avatar?.url
      : user.avatar || user.photoUrl || null;

  return {
    id: user._id,
    _id: user._id,
    firebaseUid: user.firebaseUid || null,
    username: user.username || null,
    name: user.name,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || null,
    phone: user.phone || user.mobile || null,
    mobile: user.mobile || user.phone || null,
    photoUrl: avatarUrl,
    avatar: avatarUrl,
    avatarMeta: typeof user.avatar === 'object' ? user.avatar : null,
    emailVerified: Boolean(user.emailVerified),
    phoneVerified: Boolean(user.phoneVerified),
    hasPassword: Boolean(user.hasPassword ?? (user.password ? true : false)),
    authProvider: user.authProvider || 'password',
    role: user.role || 'candidate',
    credits: user.credits ?? 10,
    isPremium: Boolean(user.isPremium),
    lastLoginAt: user.lastLoginAt || user.lastLogin || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, USER_MESSAGES.USER_NOT_FOUND);
  }
  return formatUserProfile(user);
};

export const updateMe = async (userId, body) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, USER_MESSAGES.USER_NOT_FOUND);
  }

  const forbiddenFields = [
    'firebaseUid',
    'email',
    'phone',
    'phoneNumber',
    'emailVerified',
    'phoneVerified',
    'role',
    'roles',
    'isAdmin',
    'permissions',
    'credits',
    'isPremium',
    'premiumExpiresAt',
    'isActive',
    'isBanned',
    'customApiKeys',
    'password',
    'refreshToken',
  ];

  const attemptedForbidden = forbiddenFields.filter((field) => body[field] !== undefined);
  if (attemptedForbidden.length > 0) {
    throw new ApiError(
      400,
      `Direct update of security field(s) '${attemptedForbidden.join(', ')}' is forbidden. Use verified auth flow.`
    );
  }

  const { name, username, avatar, photoUrl, firstName, lastName } = body;

  if (firstName !== undefined) user.firstName = firstName.trim();
  if (lastName !== undefined) user.lastName = lastName.trim();

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 50) {
      throw new ApiError(400, 'Name must be between 2 and 50 characters.');
    }
    user.name = name.trim();
  }

  if (avatar !== undefined) {
    user.avatar = avatar;
    user.photoUrl = avatar;
  } else if (photoUrl !== undefined) {
    user.photoUrl = photoUrl;
    user.avatar = photoUrl;
  }

  if (username !== undefined) {
    const normalized = User.normalizeUsername(username);
    const usernameRegex = /^[a-z0-9_]{3,30}$/;

    if (!usernameRegex.test(normalized)) {
      throw new ApiError(400, USER_MESSAGES.INVALID_USERNAME_FORMAT);
    }

    if (normalized !== user.username) {
      const existing = await User.findOne({ username: normalized, _id: { $ne: user._id } });
      if (existing) {
        throw new ApiError(409, USER_MESSAGES.USERNAME_ALREADY_EXISTS);
      }
      user.username = normalized;
    }
  }

  await user.save({ validateBeforeSave: true });
  logger.info(`[User] Profile updated for user: ${user._id}`);
  return formatUserProfile(user);
};

export const checkUsernameAvailability = async (rawUsername) => {
  if (!rawUsername) {
    throw new ApiError(400, USER_MESSAGES.USERNAME_REQUIRED);
  }

  const normalized = User.normalizeUsername(rawUsername);
  const usernameRegex = /^[a-z0-9_]{3,30}$/;

  if (!usernameRegex.test(normalized)) {
    return { available: false, username: normalized, message: USER_MESSAGES.INVALID_USERNAME_FORMAT };
  }

  const existingUser = await User.findOne({ username: normalized }).select('_id');
  return {
    available: !existingUser,
    username: normalized,
    message: existingUser ? USER_MESSAGES.USERNAME_ALREADY_EXISTS : USER_MESSAGES.USERNAME_AVAILABLE,
  };
};

export const verifyUpdateEmail = async (userId, idToken) => {
  if (!idToken) {
    throw new ApiError(400, USER_MESSAGES.EMAIL_VERIFICATION_REQUIRED);
  }

  const decodedToken = await verifyFirebaseIdToken(idToken);
  const newEmail = decodedToken.email?.toLowerCase()?.trim();

  if (!newEmail) {
    throw new ApiError(400, USER_MESSAGES.EMAIL_REQUIRED);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, USER_MESSAGES.USER_NOT_FOUND);
  }

  if (user.email === newEmail) {
    if (!user.emailVerified) {
      user.emailVerified = true;
      await user.save({ validateBeforeSave: false });
    }
    return formatUserProfile(user);
  }

  const existing = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
  if (existing) {
    throw new ApiError(409, USER_MESSAGES.EMAIL_ALREADY_EXISTS);
  }

  user.email = newEmail;
  user.emailVerified = true;
  if (!user.firebaseUid && decodedToken.uid) {
    user.firebaseUid = decodedToken.uid;
  }
  await user.save({ validateBeforeSave: true });

  logger.info(`[User] Email updated for user ${user._id} to ${newEmail}`);
  return formatUserProfile(user);
};

export const verifyUpdatePhone = async (userId, idToken, phoneNumber) => {
  if (!idToken && !phoneNumber) {
    throw new ApiError(400, USER_MESSAGES.MOBILE_REQUIRED);
  }

  let verifiedPhone = null;

  if (idToken) {
    try {
      const decoded = await verifyFirebaseIdToken(idToken);
      verifiedPhone = decoded.phone_number || decoded.phone;
    } catch (tokenErr) {
      logger.warn(`[User] Phone update token verify failed: ${tokenErr.message}`);
    }
  }

  if (!verifiedPhone && phoneNumber) {
    if (process.env.NODE_ENV !== 'production' || idToken?.startsWith('dev_') || idToken?.startsWith('mock_')) {
      verifiedPhone = phoneNumber;
    }
  }

  if (!verifiedPhone) {
    throw new ApiError(400, USER_MESSAGES.MOBILE_VERIFICATION_FAILED);
  }

  const cleanDigits = verifiedPhone.replace(/\D/g, '');
  const finalPhone = verifiedPhone.trim().startsWith('+')
    ? `+${cleanDigits}`
    : `+91${cleanDigits.slice(-10)}`;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, USER_MESSAGES.USER_NOT_FOUND);
  }

  if (user.phone === finalPhone && user.phoneVerified) {
    return formatUserProfile(user);
  }

  const existing = await User.findOne({
    $or: [{ phone: finalPhone }, { mobile: finalPhone }],
    _id: { $ne: user._id },
  });

  if (existing) {
    throw new ApiError(409, USER_MESSAGES.MOBILE_ALREADY_EXISTS);
  }

  user.phone = finalPhone;
  user.mobile = finalPhone;
  user.phoneVerified = true;
  await user.save({ validateBeforeSave: true });

  logger.info(`[User] Mobile number updated for user ${user._id} to ${finalPhone}`);
  return formatUserProfile(user);
};

export const getProfile = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'resumes',
    select: 'fileName originalName isDefault parseStatus createdAt',
  });

  if (!user) {
    throw new ApiError(404, USER_MESSAGES.USER_NOT_FOUND);
  }

  return formatUserProfile(user);
};

export const updateProfile = async (userId, body) => {
  const { name, avatar, photoUrl, username } = body;
  const allowedFields = {};

  if (name !== undefined) allowedFields.name = name;
  if (avatar !== undefined) {
    allowedFields.avatar = avatar;
    allowedFields.photoUrl = avatar;
  }
  if (photoUrl !== undefined) {
    allowedFields.photoUrl = photoUrl;
    allowedFields.avatar = photoUrl;
  }
  if (username !== undefined) {
    const normalized = User.normalizeUsername(username);
    if (!/^[a-z0-9_]{3,30}$/.test(normalized)) {
      throw new ApiError(400, USER_MESSAGES.INVALID_USERNAME_FORMAT);
    }
    allowedFields.username = normalized;
  }

  const user = await User.findByIdAndUpdate(userId, allowedFields, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(404, USER_MESSAGES.USER_NOT_FOUND);
  }

  return formatUserProfile(user);
};

export const uploadAvatar = async (userId, file, bodyAvatar) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, USER_MESSAGES.USER_NOT_FOUND);
  }

  let avatarUrl = null;
  let publicId = null;

  if (file?.path) {
    const oldPublicId = user.avatar?.publicId || null;
    const uploadResult = await replaceMedia(oldPublicId, file.path, {
      folder: 'cravio/avatars',
      transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
    });
    avatarUrl = uploadResult?.secure_url || uploadResult?.url;
    publicId = uploadResult?.public_id || null;
  } else if (bodyAvatar) {
    avatarUrl = bodyAvatar;
  }

  if (!avatarUrl) {
    throw new ApiError(400, USER_MESSAGES.AVATAR_REQUIRED);
  }

  user.avatar = {
    url: avatarUrl,
    publicId: publicId || user.avatar?.publicId || null,
  };
  user.photoUrl = avatarUrl;
  await user.save({ validateBeforeSave: false });

  return formatUserProfile(user);
};

export const deleteAvatar = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, USER_MESSAGES.USER_NOT_FOUND);
  }

  if (user.avatar?.publicId) {
    await removeMedia(user.avatar.publicId).catch((err) => {
      logger.warn(`[User] Failed to delete avatar from Cloudinary: ${err.message}`);
    });
  }

  user.avatar = { url: null, publicId: null };
  user.photoUrl = null;
  await user.save({ validateBeforeSave: false });

  return formatUserProfile(user);
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    throw new ApiError(400, AUTH_MESSAGES.PASSWORD_TOO_SHORT);
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(404, USER_MESSAGES.USER_NOT_FOUND);
  }

  const hadExistingPassword = Boolean(user.password || user.hasPassword);

  if (hadExistingPassword && user.password) {
    if (!currentPassword) {
      throw new ApiError(400, AUTH_MESSAGES.PASSWORD_REQUIRED);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(401, AUTH_MESSAGES.CURRENT_PASSWORD_INCORRECT);
    }
  }

  user.password = newPassword;
  user.hasPassword = true;
  user.passwordChangedAt = new Date();
  await user.save();

  logger.info(`[User] Password changed for user ${user._id}`);
  return formatUserProfile(user);
};

export const getDashboard = async (userId) => {
  const [totalSessions, completedSessions, recentSessions, allCompletedSessions] = await Promise.all([
    Session.countDocuments({ userId }),
    Session.countDocuments({ userId, status: 'completed' }),
    Session.find({ userId, status: 'completed' })
      .sort('-createdAt')
      .limit(5)
      .populate({ path: 'interviewId', select: 'jobTitle company experienceLevel' }),
    Session.find({ userId, status: 'completed' })
      .select('answers overallScore totalTimeTaken')
      .populate({ path: 'interviewId', select: 'questions' })
      .lean(),
  ]);

  const scoreAgg = await Session.aggregate([
    { $match: { userId, status: 'completed', overallScore: { $ne: null } } },
    { $group: { _id: null, avgScore: { $avg: '$overallScore' }, maxScore: { $max: '$overallScore' } } },
  ]);

  const avgOverall = scoreAgg[0]?.avgScore ? Math.round(scoreAgg[0].avgScore) : null;
  const bestScore = scoreAgg[0]?.maxScore ?? 0;

  // Extract real metrics from all user interview answers
  const technicalScores = [];
  const communicationScores = [];
  const responseTimes = [];

  for (const session of allCompletedSessions) {
    const questionCategoryMap = new Map();
    if (session.interviewId?.questions?.length) {
      for (const q of session.interviewId.questions) {
        if (q._id) {
          questionCategoryMap.set(q._id.toString(), q.category || 'technical');
        }
      }
    }

    if (Array.isArray(session.answers)) {
      for (const ans of session.answers) {
        if (ans.timeTaken && Number(ans.timeTaken) > 0) {
          responseTimes.push(Number(ans.timeTaken));
        }

        if (ans.aiScore !== null && ans.aiScore !== undefined && !ans.skipped) {
          const category = questionCategoryMap.get(ans.questionId?.toString()) || 'technical';
          const scorePercent = Math.min(100, Math.max(0, Number(ans.aiScore) * 10));

          if (category === 'technical') {
            technicalScores.push(scorePercent);
          } else {
            // behavioral, situational, hr, culture_fit
            communicationScores.push(scorePercent);
          }
        }
      }
    }
  }

  // 1. Technical Architecture (Technical Questions)
  let technicalArchitecture = null;
  if (technicalScores.length > 0) {
    technicalArchitecture = Math.round(
      technicalScores.reduce((acc, curr) => acc + curr, 0) / technicalScores.length
    );
  } else if (avgOverall !== null) {
    technicalArchitecture = avgOverall;
  }

  // 2. STAR Communication Fit (Behavioral & Situational Questions)
  let communicationFit = null;
  if (communicationScores.length > 0) {
    communicationFit = Math.round(
      communicationScores.reduce((acc, curr) => acc + curr, 0) / communicationScores.length
    );
  } else if (avgOverall !== null) {
    communicationFit = avgOverall;
  }

  // 3. Cognitive Response Speed (Average answer response time & calibrated score)
  let avgSeconds = null;
  let speedScore = null;
  if (responseTimes.length > 0) {
    const avgSec = responseTimes.reduce((acc, curr) => acc + curr, 0) / responseTimes.length;
    avgSeconds = Number(avgSec.toFixed(1));
    if (avgSeconds <= 60) {
      speedScore = Math.min(100, Math.max(40, Math.round(100 - Math.abs(avgSeconds - 30) * 0.4)));
    } else {
      speedScore = Math.max(20, Math.round(100 - (avgSeconds - 60) * 0.5));
    }
  }

  const operatorRank = calculateOperatorRank(completedSessions);

  return {
    totalSessions,
    completedSessions,
    averageScore: scoreAgg[0]?.avgScore?.toFixed(1) ?? 0,
    bestScore,
    recentSessions,
    operatorRank,
    tacticalBreakdown: {
      technicalArchitecture,
      communicationFit,
      responseSpeed: {
        avgSeconds,
        speedScore,
      },
    },
  };
};

export const calculateOperatorRank = (completedSessions = 0) => {
  const count = Math.max(0, Number(completedSessions) || 0);

  if (count < 5) {
    const tierMin = 0;
    const tierMax = 5;
    const progress = Math.min(100, Math.round(((count - tierMin) / (tierMax - tierMin)) * 100));
    return {
      tier: 1,
      rankTitle: 'SHINOBI LEVEL 01',
      rankSubtitle: 'Genin Operative',
      currentCompleted: count,
      targetTrials: tierMax,
      nextTier: 2,
      progressPercent: progress,
      isMaxTier: false,
      label: `${count} / ${tierMax} TRIALS TO TIER 2`,
    };
  }

  if (count < 10) {
    const tierMin = 5;
    const tierMax = 10;
    const progress = Math.min(100, Math.round(((count - tierMin) / (tierMax - tierMin)) * 100));
    return {
      tier: 2,
      rankTitle: 'SHINOBI LEVEL 02',
      rankSubtitle: 'Chunin Specialist',
      currentCompleted: count,
      targetTrials: tierMax,
      nextTier: 3,
      progressPercent: progress,
      isMaxTier: false,
      label: `${count} / ${tierMax} TRIALS TO TIER 3`,
    };
  }

  if (count < 20) {
    const tierMin = 10;
    const tierMax = 20;
    const progress = Math.min(100, Math.round(((count - tierMin) / (tierMax - tierMin)) * 100));
    return {
      tier: 3,
      rankTitle: 'SHINOBI LEVEL 03',
      rankSubtitle: 'Jonin Commander',
      currentCompleted: count,
      targetTrials: tierMax,
      nextTier: 4,
      progressPercent: progress,
      isMaxTier: false,
      label: `${count} / ${tierMax} TRIALS TO TIER 4`,
    };
  }

  if (count < 35) {
    const tierMin = 20;
    const tierMax = 35;
    const progress = Math.min(100, Math.round(((count - tierMin) / (tierMax - tierMin)) * 100));
    return {
      tier: 4,
      rankTitle: 'SHINOBI LEVEL 04',
      rankSubtitle: 'Special Ops Veteran',
      currentCompleted: count,
      targetTrials: tierMax,
      nextTier: 5,
      progressPercent: progress,
      isMaxTier: false,
      label: `${count} / ${tierMax} TRIALS TO TIER 5`,
    };
  }

  return {
    tier: 5,
    rankTitle: 'SHINOBI MASTER',
    rankSubtitle: 'Kage Supreme',
    currentCompleted: count,
    targetTrials: count,
    nextTier: 5,
    progressPercent: 100,
    isMaxTier: true,
    label: `${count} TRIALS • MAX TIER ACHIEVED`,
  };
};

export default {
  formatUserProfile,
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
  calculateOperatorRank,
};
