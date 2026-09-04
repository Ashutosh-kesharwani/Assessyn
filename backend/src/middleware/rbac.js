import ApiError from '../utils/ApiError.js';
import { AUTH_MESSAGES } from '../constants/messages.constants.js';

// Master Roles & Permissions Map
export const ROLE_PERMISSIONS = {
  super_admin: ['*'], // wildcard access
  admin: [
    'view:users', 'update:users',
    'view:jobs', 'create:jobs', 'update:jobs', 'delete:jobs',
    'view:templates', 'create:templates', 'update:templates', 'delete:templates',
    'view:payments', 'view:scraper', 'run:scraper',
    'view:prompts', 'update:prompts',
    'view:logs', 'view:analytics', 'view:settings', 'update:settings'
  ],
  content_manager: [
    'view:jobs', 'create:jobs', 'update:jobs', 'delete:jobs',
    'view:templates', 'create:templates', 'update:templates', 'delete:templates',
    'view:scraper', 'run:scraper',
  ],
  support: [
    'view:users', 'update:users',
    'view:payments', 'refund:payments',
    'view:logs',
  ],
};

// Evaluate permissions check
export const hasPermission = (role, permission) => {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  if (perms.includes('*')) return true; // super admin override
  return perms.includes(permission);
};

// Retrieve permissions list for a role
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

// Express check permission middleware
export const requirePermission = (permission) => {
  return (req, res, next) => {
    // req.admin must be attached by auth middleware
    const admin = req.admin || req.user;
    if (!admin) {
      return next(new ApiError(401, AUTH_MESSAGES.UNAUTHORIZED));
    }

    if (!hasPermission(admin.role, permission)) {
      return next(new ApiError(403, AUTH_MESSAGES.FORBIDDEN));
    }

    next();
  };
};

export default {
  ROLE_PERMISSIONS,
  hasPermission,
  getRolePermissions,
  requirePermission,
};
