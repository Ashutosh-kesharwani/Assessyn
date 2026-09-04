import jwt from 'jsonwebtoken';

/**
 * Generate a signed access token for a user
 */
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId, _id: userId },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    }
  );
};

/**
 * Generate a signed refresh token for a user
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, _id: userId },
    process.env.REFRESH_TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    }
  );
};

/**
 * Send JWT in response with user data
 */
export const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const userResponse = {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    firebaseUid: user.firebaseUid,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    hasPassword: Boolean(user.hasPassword ?? (user.password ? true : false)),
    authProvider: user.authProvider,
    role: user.role,
    avatar: user.avatar,
    totalSessions: user.totalSessions,
    createdAt: user.createdAt,
  };

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: userResponse,
  });
};

export default { generateAccessToken, generateRefreshToken, sendTokenResponse };
