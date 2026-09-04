import express from 'express';
import { verifyJWT } from '../middleware/index.js';
import {
  saveUserApiKeys,
  getUserApiKeys,
  restructureResumeController,
  generateProjectsController,
  generateQuestionBankController,
  generateRoadmapController,
  proChatController,
  getRadarJobsController,
} from '../controllers/pro.controller.js';

const router = express.Router();

// Public / Authenticated endpoints
router.get('/radar-jobs', getRadarJobsController);

// Authenticated Pro Endpoints
router.use(verifyJWT);

router.get('/api-keys', getUserApiKeys);
router.put('/api-keys', saveUserApiKeys);
router.post('/resume-restructure', restructureResumeController);
router.post('/projects', generateProjectsController);
router.post('/questions', generateQuestionBankController);
router.post('/roadmap', generateRoadmapController);
router.post('/chat', proChatController);

export default router;
