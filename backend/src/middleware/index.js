import verifyJWT, {
  protect,
  restrictTo,
  firebaseAuthMiddleware,
} from './auth.middleware.js';

import adminAuth, {
  protectAdmin,
  requireSuperAdmin,
} from './adminAuth.middleware.js';

import rbac, {
  ROLE_PERMISSIONS,
  hasPermission,
  getRolePermissions,
  requirePermission,
} from './rbac.js';

import validate from './validate.js';
import rateLimiter from './rateLimiter.middleware.js';
import imageUpload from './multer/imageUpload.js';
import documentUpload from './multer/documentUpload.js';
import audioUpload from './multer/audioUpload.js';
import requestLogger from './requestLogger.js';
import errorHandler from './error.middleware.js';

export const upload = documentUpload({ maxSizeMB: 5 });
export const uploadAudio = audioUpload({ maxSizeMB: 15 });

// Named Exports for selective importing across routes & app
export {
  // Authentication & Authorization
  verifyJWT,
  protect,
  restrictTo,
  firebaseAuthMiddleware,

  // Admin Authentication
  protectAdmin,
  requireSuperAdmin,

  // Role-Based Access Control (RBAC)
  ROLE_PERMISSIONS,
  hasPermission,
  getRolePermissions,
  requirePermission,

  // Validation
  validate,

  // Rate Limiter
  rateLimiter,

  // Upload Handlers
  imageUpload,
  documentUpload,
  audioUpload,

  // Request Logger
  requestLogger,

  // Global Error Handler
  errorHandler,
};

// Default export containing all middlewares
export default {
  verifyJWT,
  protect,
  restrictTo,
  firebaseAuthMiddleware,
  protectAdmin,
  requireSuperAdmin,
  ROLE_PERMISSIONS,
  hasPermission,
  getRolePermissions,
  requirePermission,
  validate,
  rateLimiter,
  upload,
  uploadAudio,
  imageUpload,
  documentUpload,
  audioUpload,
  requestLogger,
  errorHandler,
};
