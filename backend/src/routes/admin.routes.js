import express from 'express';
const router = express.Router();

import {
  protectAdmin,
  requireSuperAdmin,
  requirePermission,
  audioUpload,
} from '../middleware/index.js';

import {
  adminLogin,
  adminLogout,
  adminRefreshToken,
  getAdminMe,
} from '../controllers/adminAuth.controller.js';

import {
  getStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  bulkUserAction,
  getAllInterviews,
  deleteInterview,
  getAllSessions,
  deleteSession,
  getAllResumes,
  deleteResume,
} from '../controllers/admin.controller.js';

import {
  createJob,
  getAllJobs,
  getJobStats,
  getJobById,
  updateJob,
  deleteJob,
  bulkJobAction,
} from '../controllers/adminJob.controller.js';

import {
  getScraperStatus,
  updateScraperSettings,
  triggerManualScrape,
  pauseScraperScheduler,
  resumeScraperScheduler,
  getScraperLogs,
} from '../controllers/adminScraper.controller.js';

import {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
} from '../controllers/adminTemplate.controller.js';

import {
  getAllPrompts,
  getPromptById,
  updatePrompt,
  restorePromptVersion,
} from '../controllers/adminPrompt.controller.js';

import {
  createPlan,
  getAllPlans,
  getPlanStats,
  getPlanById,
  updatePlan,
  deletePlan,
} from '../controllers/adminPlan.controller.js';

import {
  getAllTransactions,
  refundTransaction,
  getPaymentStats,
  getWebhookLogs,
} from '../controllers/adminPayment.controller.js';

import {
  getSettings,
  saveSettings,
  uploadThemeSound,
  resetThemeSound,
} from '../controllers/adminSettings.controller.js';


import {
  getAnalytics,
} from '../controllers/adminAnalytics.controller.js';

import {
  getAllLogs,
} from '../controllers/adminLog.controller.js';

import {
  getAdminNotifications,
  createBroadcast,
  updateBroadcast,
  deleteBroadcast,
} from '../controllers/notification.controller.js';

// ── Admin Auth (public) ───────────────────────────────────────────
router.post('/auth/login',   adminLogin);
router.post('/auth/logout',  adminLogout);
router.post('/auth/refresh', adminRefreshToken);
router.get('/auth/me',       protectAdmin, getAdminMe);

// ── Protected admin routes (require admin or super_admin role) ─────
router.use(protectAdmin);

// ── Stats ─────────────────────────────────────────────────────────
router.get('/stats', getStats);

// ── Users ─────────────────────────────────────────────────────────
router.get('/users',           getAllUsers);
router.post('/users/bulk',     bulkUserAction);
router.get('/users/:id',       getUserById);
router.patch('/users/:id',     updateUser);
router.delete('/users/:id',    requireSuperAdmin, deleteUser);

// ── Jobs ──────────────────────────────────────────────────────────
router.get('/jobs',            getAllJobs);
router.get('/jobs/stats',      getJobStats);
router.post('/jobs',           createJob);
router.post('/jobs/bulk',      bulkJobAction);
router.get('/jobs/:id',        getJobById);
router.patch('/jobs/:id',      updateJob);
router.delete('/jobs/:id',     deleteJob);

// ── Interviews ────────────────────────────────────────────────────
router.get('/interviews',              getAllInterviews);
router.delete('/interviews/:id',       deleteInterview);

// ── Sessions ──────────────────────────────────────────────────────
router.get('/sessions',                getAllSessions);
router.delete('/sessions/:id',         deleteSession);

// ── Resumes ───────────────────────────────────────────────────────
router.get('/resumes',                 getAllResumes);
router.delete('/resumes/:id',          deleteResume);

// ── Scraper Control ───────────────────────────────────────────────
router.get('/scraper/status',          getScraperStatus);
router.patch('/scraper/settings',      requirePermission('update:settings'), updateScraperSettings);
router.post('/scraper/run',            requirePermission('run:scraper'), triggerManualScrape);
router.post('/scraper/pause',          requirePermission('run:scraper'), pauseScraperScheduler);
router.post('/scraper/resume',         requirePermission('run:scraper'), resumeScraperScheduler);
router.get('/scraper/logs',            getScraperLogs);

// ── Interview Templates ───────────────────────────────────────────
router.get('/templates',               getAllTemplates);
router.post('/templates',              requirePermission('create:templates'), createTemplate);
router.get('/templates/:id',           getTemplateById);
router.patch('/templates/:id',         requirePermission('update:templates'), updateTemplate);
router.delete('/templates/:id',        requirePermission('delete:templates'), deleteTemplate);

// ── Prompt Editor Control ─────────────────────────────────────────
router.get('/prompts',                 getAllPrompts);
router.get('/prompts/:id',             getPromptById);
router.patch('/prompts/:id',           requirePermission('update:prompts'), updatePrompt);
router.post('/prompts/:id/restore',    requirePermission('update:prompts'), restorePromptVersion);

// ── Subscription Plans ────────────────────────────────────────────
router.get('/plans',                   getAllPlans);
router.get('/plans/stats',             getPlanStats);
router.post('/plans',                  requirePermission('update:settings'), createPlan);
router.get('/plans/:id',               getPlanById);
router.patch('/plans/:id',             requirePermission('update:settings'), updatePlan);
router.delete('/plans/:id',            requirePermission('update:settings'), deletePlan);

// ── Payment Control ───────────────────────────────────────────────
router.get('/payments/transactions',   getAllTransactions);
router.get('/payments/stats',          getPaymentStats);
router.post('/payments/transactions/:id/refund', requirePermission('refund:payments'), refundTransaction);
router.get('/payments/webhooks',       getWebhookLogs);

// ── Settings Control ──────────────────────────────────────────────
router.get('/settings',                getSettings);
router.patch('/settings',              requirePermission('update:settings'), saveSettings);

// ── Shinobi Elemental Audio Control ──────────────────────────────
router.post('/theme-sounds/:themeId/upload', requirePermission('update:settings'), audioUpload({ maxSizeMB: 15 }).single('audio'), uploadThemeSound);
router.delete('/theme-sounds/:themeId/reset', requirePermission('update:settings'), resetThemeSound);

// ── Global Broadcasts & Announcements Control ─────────────────────
router.get('/notifications',        getAdminNotifications);
router.post('/notifications',       requirePermission('update:settings'), createBroadcast);
router.patch('/notifications/:id',  requirePermission('update:settings'), updateBroadcast);
router.delete('/notifications/:id', requirePermission('update:settings'), deleteBroadcast);

// ── Analytics Control ─────────────────────────────────────────────
router.get('/analytics/stats',         getAnalytics);

// ── Audit Log Control ─────────────────────────────────────────────
router.get('/logs',                    getAllLogs);

export default router;
