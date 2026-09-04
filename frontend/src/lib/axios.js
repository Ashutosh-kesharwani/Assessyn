import axios from 'axios';
import { API_BASE_URL, REFRESH_ACCESS_TOKEN_URL } from '../constants/api.constants.js';
import { AUTH_EXCLUDED_ROUTES } from '../constants/auth.constants.js';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Helper: read token from Zustand persisted storage
const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem('ai-interview-auth');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed?.state ?? parsed;
  } catch {
    return {};
  }
};

// Request Interceptor: attaches Bearer token if available
api.interceptors.request.use(
  (config) => {
    const { accessToken } = getStoredAuth();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: silent token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Handle 429 Rate Limit
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers?.['retry-after'] || error.response.data?.retryAfter || 60;
      const currentPath = window.location.pathname;
      if (currentPath !== '/rate-limited') {
        window.location.href = `/rate-limited?retryAfter=${retryAfter}&from=${encodeURIComponent(currentPath)}`;
      }
      return Promise.reject(error);
    }

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response.status === 401;
    const isRetry = originalRequest._retry;
    const isExcludedRoute = AUTH_EXCLUDED_ROUTES.some((route) =>
      originalRequest.url?.includes(route)
    );

    if (!isUnauthorized || isRetry || isExcludedRoute) {
      return Promise.reject(error);
    }

    // Queue concurrent requests if a refresh is already in flight
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const { refreshToken } = getStoredAuth();

    try {
      // Refresh request sends HttpOnly cookies automatically, and optional token in body
      const response = await api.post(REFRESH_ACCESS_TOKEN_URL, { refreshToken });
      const data = response.data;
      const newToken = data.data?.accessToken || data.accessToken;

      if (newToken) {
        // Update stored token in Zustand persistence
        const raw = localStorage.getItem('ai-interview-auth');
        const zustandStore = raw ? JSON.parse(raw) : { state: {} };
        zustandStore.state = {
          ...zustandStore.state,
          accessToken: newToken,
          user: data.data?.user || data.user || zustandStore.state.user,
        };
        localStorage.setItem('ai-interview-auth', JSON.stringify(zustandStore));

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }

      processQueue(null, newToken);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem('ai-interview-auth');
      window.dispatchEvent(new Event('auth:logout'));
      window.dispatchEvent(new Event('auth:session-expired'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
