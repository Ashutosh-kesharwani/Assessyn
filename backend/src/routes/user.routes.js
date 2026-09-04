import express from 'express';
import { verifyJWT } from '../middleware/index.js';
import imageUpload from '../middleware/multer/imageUpload.js';
import {
  getMe,
  updateMe,
  verifyUpdateEmail,
  verifyUpdatePhone,
  checkUsernameAvailability,
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  getDashboard,
} from '../controllers/user.controller.js';
import { validateUpdateMe, validateChangePassword } from '../validators/user.validator.js';

const router = express.Router();
const uploadAvatarMiddleware = imageUpload({ maxSizeMB: 5 });

// ─── Public Routes ────────────────────────────────────────────────
router.get('/username/:username/availability', checkUsernameAvailability);

// ─── Protected Routes ─────────────────────────────────────────────
router.use(verifyJWT);

router.get('/me', getMe);
router.patch('/me', validateUpdateMe, updateMe);
router.post('/me/email/verify-update', verifyUpdateEmail);
router.post('/me/phone/verify-update', verifyUpdatePhone);

// Legacy & Utility endpoints
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/avatar', uploadAvatarMiddleware.single('avatar'), uploadAvatar);
router.delete('/avatar', deleteAvatar);
router.put('/change-password', validateChangePassword, changePassword);
router.get('/dashboard', getDashboard);

export default router;
