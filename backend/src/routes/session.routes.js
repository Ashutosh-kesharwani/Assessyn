import express from 'express';
const router = express.Router();
import { verifyJWT } from '../middleware/index.js';
import {
  startSession,
  submitAnswer,
  completeSession,
  getMySessions,
  getSessionById,
} from '../controllers/session.controller.js';

router.use(verifyJWT);

router.get('/', getMySessions);
router.post('/start', startSession);
router.get('/:id', getSessionById);
router.post('/:id/answer', submitAnswer);
router.post('/:id/complete', completeSession);

export default router;
