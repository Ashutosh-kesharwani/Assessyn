import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  firebaseLogin,
  syncFirebaseAuth,
  refreshAccessToken,
  refreshToken,
  getCurrentUser,
  getMe,
  logout,
  resolveUsername,
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middleware/index.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public Authentication Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/firebase-login', firebaseLogin);
router.post('/firebase', syncFirebaseAuth); // legacy route compatibility
router.post('/refresh-token', refreshAccessToken);
router.post('/refresh', refreshToken); // legacy route compatibility
router.post('/resolve-username', resolveUsername);

// Protected Authentication Routes (Using verifyJWT)
router.get('/me', verifyJWT, getCurrentUser);
router.post('/logout', verifyJWT, logout);

export default router;
