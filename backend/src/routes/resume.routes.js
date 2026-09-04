import express from 'express';
const router = express.Router();
import { verifyJWT, documentUpload } from '../middleware/index.js';
import {
  uploadResume,
  getMyResumes,
  deleteResume,
  setDefaultResume,
  parseResume,
  chunkPreview,
} from '../controllers/resume.controller.js';

router.use(verifyJWT);

router.post('/upload', documentUpload({ maxSizeMB: 5 }).single('resume'), uploadResume);
router.post('/chunk-preview', chunkPreview);
router.get('/', getMyResumes);
router.delete('/:id', deleteResume);
router.patch('/:id/default', setDefaultResume);
router.post('/:id/parse', parseResume);

export default router;
