import { body } from 'express-validator';
import { validate } from '../middleware/index.js';

export const validateChangePassword = [
  body('newPassword')
    .isString()
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long.'),
  validate,
];

export const validateUpdateMe = [
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters.'),
  body('username')
    .optional()
    .matches(/^[a-z0-9_]{3,30}$/)
    .withMessage('Username must be 3-30 lowercase alphanumeric characters or underscores.'),
  validate,
];

export default {
  validateChangePassword,
  validateUpdateMe,
};
