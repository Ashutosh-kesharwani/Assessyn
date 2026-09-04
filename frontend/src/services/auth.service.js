/**
 * services/auth.service.js
 *
 * All authentication-related API calls.
 * Returns normalized response data using standardized axios instance.
 */

import api from '@/lib/axios';

export const authService = {
  /**
   * Register a new user
   */
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data.data || data;
  },

  /**
   * Login with credentials
   */
  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data.data || data;
  },

  /**
   * Firebase OAuth & Mobile Phone Authentication
   */
  firebaseLogin: async (payload) => {
    const { data } = await api.post('/auth/firebase-login', payload);
    return data.data || data;
  },

  /**
   * Refresh access token using HttpOnly cookie or incoming refresh token
   */
  refreshToken: async (refreshToken) => {
    const { data } = await api.post('/auth/refresh-token', { refreshToken });
    return data.data || data;
  },

  /**
   * Get currently authenticated user from session/token
   */
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data.data || data;
  },

  /**
   * Resolve user email from username
   */
  resolveUsername: async (username) => {
    const { data } = await api.post('/auth/resolve-username', { username });
    return data.data || data;
  },

  /**
   * Invalidate session and clear auth cookies
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Cookies or session expired
    }
  },
};

export default authService;
