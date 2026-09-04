import express from 'express';
import { verifyJWT } from '../middleware/index.js';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  dismissForUser,
} from '../controllers/notification.controller.js';

const router = express.Router();

// All candidate notification routes require authentication
router.use(verifyJWT);

router.get('/', getUserNotifications);
router.patch('/:id/read', markAsRead);
router.post('/mark-all-read', markAllAsRead);
router.delete('/:id/dismiss', dismissForUser);

export default router;
