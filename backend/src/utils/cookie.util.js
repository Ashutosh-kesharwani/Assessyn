const isProduction = process.env.NODE_ENV === 'production';

export const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
};

export const accessTokenCookieOptions = {
  ...authCookieOptions,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

export const refreshTokenCookieOptions = {
  ...authCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
  if (accessToken) {
    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  }
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
  }
  return res;
};

export const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', authCookieOptions);
  res.clearCookie('refreshToken', authCookieOptions);
  return res;
};

export default {
  authCookieOptions,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  setAuthCookies,
  clearAuthCookies,
};
