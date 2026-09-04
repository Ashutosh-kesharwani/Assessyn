export const AUTH_MESSAGES = {
  UNAUTHORIZED: 'Authentication required. Please log in.',
  INVALID_ACCESS_TOKEN: 'Invalid access token. Please authenticate again.',
  ACCESS_TOKEN_EXPIRED: 'Access token expired. Please refresh session.',
  REFRESH_TOKEN_EXPIRED: 'Refresh session expired. Please log in again.',
  INVALID_REFRESH_TOKEN: 'Invalid refresh session. Please log in again.',
  TOKEN_REFRESHED: 'Access session successfully refreshed.',
  LOGIN_SUCCESS: 'Logged in successfully.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  REGISTRATION_SUCCESS: 'Candidate registered successfully.',
  ACCOUNT_DEACTIVATED: 'This account has been deactivated.',
  ACCOUNT_BANNED: 'This account has been suspended.',
  FIREBASE_TOKEN_REQUIRED: 'Firebase ID token is required.',
  FIREBASE_AUTH_FAILED: 'Firebase authentication failed.',
};

export const AUTH_EXCLUDED_ROUTES = [
  '/auth/firebase-login',
  '/auth/firebase',
  '/auth/refresh-token',
  '/auth/refresh',
  '/auth/me',
  '/auth/logout',
  '/auth/login',
  '/auth/register',
  '/auth/resolve-username',
];

export default {
  AUTH_MESSAGES,
  AUTH_EXCLUDED_ROUTES,
};
