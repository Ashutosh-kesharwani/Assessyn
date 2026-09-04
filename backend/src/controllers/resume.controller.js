import resumeService from '../services/resume.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { RESUME_MESSAGES } from '../constants/messages.constants.js';

// ─── POST /api/resumes/upload ─────────────────────────────────────
export const uploadResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.uploadResume(req.user._id, req.file);
  return res
    .status(201)
    .json(new ApiResponse(201, { resume }, RESUME_MESSAGES.RESUME_UPLOADED));
});

// ─── GET /api/resumes ─────────────────────────────────────────────
export const getMyResumes = asyncHandler(async (req, res) => {
  const data = await resumeService.getMyResumes(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, data, RESUME_MESSAGES.RESUMES_FETCHED));
});

// ─── DELETE /api/resumes/:id ──────────────────────────────────────
export const deleteResume = asyncHandler(async (req, res) => {
  await resumeService.deleteResume(req.user._id, req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, RESUME_MESSAGES.RESUME_DELETED));
});

// ─── PATCH /api/resumes/:id/default ──────────────────────────────
export const setDefaultResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.setDefaultResume(req.user._id, req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, { resume }, RESUME_MESSAGES.DEFAULT_RESUME_SET));
});

// ─── POST /api/resumes/:id/parse ──────────────────────────────────
export const parseResume = asyncHandler(async (req, res) => {
  const result = await resumeService.parseResume(
    req.user._id,
    req.params.id,
    req.body.jobDescription
  );
  const parsedData = result?.parsedData || result;
  const resume = result?.resume;
  return res
    .status(200)
    .json(new ApiResponse(200, { parsedData, resume }, RESUME_MESSAGES.RESUME_PARSED));
});

// ─── POST /api/resumes/chunk-preview ──────────────────────────────
export const chunkPreview = asyncHandler(async (req, res) => {
  const preview = await resumeService.chunkPreview(
    req.body.resumeText,
    req.body.jobDescription
  );
  return res
    .status(200)
    .json(new ApiResponse(200, preview, RESUME_MESSAGES.PREVIEW_GENERATED));
});

export default {
  uploadResume,
  getMyResumes,
  deleteResume,
  setDefaultResume,
  parseResume,
  chunkPreview,
};
