import api from '@/lib/axios';

// ── Auth ───────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  firebaseLogin: (data) => api.post('/auth/firebase-login', data),
  refreshToken: (data) => api.post('/auth/refresh-token', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  resolveUsername: (username) => api.post('/auth/resolve-username', { username }),
};

// ── User ───────────────────────────────────────────────────────────
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.patch('/users/me', data),
  checkUsernameAvailability: (username) =>
    api.get(`/users/username/${encodeURIComponent(username)}/availability`),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) =>
    api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteAvatar: () => api.delete('/users/avatar'),
  changePassword: (data) => api.put('/users/change-password', data),
  verifyUpdateEmail: (idToken) => api.post('/users/me/email/verify-update', { idToken }),
  verifyUpdatePhone: (data) => api.post('/users/me/phone/verify-update', data),
  getDashboard: () => api.get('/users/dashboard'),
};

// ── Resume ─────────────────────────────────────────────────────────
export const resumeAPI = {
  upload: (formData) =>
    api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: () => api.get('/resumes'),
  delete: (id) => api.delete(`/resumes/${id}`),
  setDefault: (id) => api.patch(`/resumes/${id}/default`),
  parse: (id, jobDescription = '') =>
    api.post(`/resumes/${id}/parse`, { jobDescription }, { timeout: 90_000 }),
};

// ── Interview ──────────────────────────────────────────────────────
export const interviewAPI = {
  create: (data) => api.post('/interviews', data),
  generateQuestions: (id) => api.post(`/interviews/${id}/generate`),
  getAll: (params) => api.get('/interviews', { params }),
  getById: (id) => api.get(`/interviews/${id}`),
  delete: (id) => api.delete(`/interviews/${id}`),
};

// ── Session ────────────────────────────────────────────────────────
export const sessionAPI = {
  start: (interviewId) => api.post('/sessions/start', { interviewId }),
  submitAnswer: (sessionId, data) => api.post(`/sessions/${sessionId}/answer`, data),
  complete: (sessionId) => api.post(`/sessions/${sessionId}/complete`, {}, { timeout: 120_000 }),
  getAll: (params) => api.get('/sessions', { params }),
  getById: (id) => api.get(`/sessions/${id}`),
};

// ── Jobs ───────────────────────────────────────────────────────────
export const jobsAPI = {
  // Database active jobs endpoint (paginated, filtered)
  getJobs: (params) => api.get('/jobs', { params }),
  // Adzuna live search (kept for backward compatibility)
  search: (params) => api.get('/jobs/search', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  getCategories: () => api.get('/jobs/categories'),
  getRecommended: () => api.get('/jobs/recommended'),
  generateQuestionsDirect: (data) => api.post('/jobs/generate-questions', data),
};

// ── Pro Career Suite & BYOK ─────────────────────────────────────────
export const proAPI = {
  getApiKeys: () => api.get('/pro/api-keys'),
  saveApiKeys: (models) => api.put('/pro/api-keys', { models }),
  restructureResume: (data) => api.post('/pro/resume-restructure', data),
  generateProjects: (data) => api.post('/pro/projects', data),
  generateQuestions: (data) => api.post('/pro/questions', data),
  generateRoadmap: (data) => api.post('/pro/roadmap', data),
  getRadarJobs: (params) => api.get('/pro/radar-jobs', { params }),
  chatAdvisor: (data) => api.post('/pro/chat', data),
};

// ── PayU & Payments ────────────────────────────────────────────────
export const paymentAPI = {
  getPlans: () => api.get('/payment/plans'),
  initiatePayU: (data) => api.post('/payment/payu/initiate', data),
  verifyPayU: (data) => api.post('/payment/payu/verify', data),
  mockCheckout: (data) => api.post('/payment/mock-checkout', data),
  getHistory: () => api.get('/payment/history'),
};

// ── Shinobi Candidate Notifications ────────────────────────────────
export const notificationAPI = {
  getAll: () => api.get('/notifications').then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.post('/notifications/mark-all-read').then((r) => r.data),
  dismiss: (id) => api.delete(`/notifications/${id}/dismiss`).then((r) => r.data),
};

