import InterviewTemplate from '../models/InterviewTemplate.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

// ─── POST /api/admin/templates ─────────────────────────────────────
export const createTemplate = asyncHandler(async (req, res) => {
  const {
    name,
    difficulty,
    duration,
    questionCount,
    systemPrompt,
    evaluationPrompt,
    feedbackPrompt,
    voiceId,
    voiceSpeed,
    voicePitch,
    language,
  } = req.body;

  if (!name || !systemPrompt || !evaluationPrompt || !feedbackPrompt) {
    throw new ApiError(400, 'Template name and all prompts are required.');
  }

  const template = await InterviewTemplate.create({
    name: name.trim(),
    difficulty: difficulty || 'medium',
    duration: duration || 30,
    questionCount: questionCount || 5,
    systemPrompt,
    evaluationPrompt,
    feedbackPrompt,
    voiceId: voiceId || 'alloy',
    voiceSpeed: voiceSpeed || 1.0,
    voicePitch: voicePitch || 1.0,
    language: language || 'en',
    postedBy: req.admin?._id || req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { template }, 'Interview template created successfully.'));
});

// ─── GET /api/admin/templates ──────────────────────────────────────
export const getAllTemplates = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const difficulty = req.query.difficulty;

  const filter = {};
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }
  if (difficulty && difficulty !== 'all') {
    filter.difficulty = difficulty;
  }

  const [templates, total] = await Promise.all([
    InterviewTemplate.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate({ path: 'postedBy', select: 'name email' }),
    InterviewTemplate.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { templates, total, page, pages: Math.ceil(total / limit) },
      'Interview templates retrieved successfully.'
    )
  );
});

// ─── GET /api/admin/templates/:id ──────────────────────────────────
export const getTemplateById = asyncHandler(async (req, res) => {
  const template = await InterviewTemplate.findById(req.params.id)
    .populate({ path: 'postedBy', select: 'name email' });

  if (!template) {
    throw new ApiError(404, 'Template not found.');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { template }, 'Interview template retrieved successfully.'));
});

// ─── PATCH /api/admin/templates/:id ────────────────────────────────
export const updateTemplate = asyncHandler(async (req, res) => {
  const {
    name,
    difficulty,
    duration,
    questionCount,
    systemPrompt,
    evaluationPrompt,
    feedbackPrompt,
    voiceId,
    voiceSpeed,
    voicePitch,
    language,
  } = req.body;

  const template = await InterviewTemplate.findById(req.params.id);
  if (!template) {
    throw new ApiError(404, 'Template not found.');
  }

  const allowedFields = {};
  if (name !== undefined) allowedFields.name = name.trim();
  if (difficulty !== undefined) allowedFields.difficulty = difficulty;
  if (duration !== undefined) allowedFields.duration = duration;
  if (questionCount !== undefined) allowedFields.questionCount = questionCount;
  if (systemPrompt !== undefined) allowedFields.systemPrompt = systemPrompt;
  if (evaluationPrompt !== undefined) allowedFields.evaluationPrompt = evaluationPrompt;
  if (feedbackPrompt !== undefined) allowedFields.feedbackPrompt = feedbackPrompt;
  if (voiceId !== undefined) allowedFields.voiceId = voiceId;
  if (voiceSpeed !== undefined) allowedFields.voiceSpeed = voiceSpeed;
  if (voicePitch !== undefined) allowedFields.voicePitch = voicePitch;
  if (language !== undefined) allowedFields.language = language.trim();

  const updated = await InterviewTemplate.findByIdAndUpdate(req.params.id, allowedFields, {
    new: true,
    runValidators: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { template: updated }, 'Interview template updated successfully.'));
});

// ─── DELETE /api/admin/templates/:id ───────────────────────────────
export const deleteTemplate = asyncHandler(async (req, res) => {
  const template = await InterviewTemplate.findByIdAndDelete(req.params.id);
  if (!template) {
    throw new ApiError(404, 'Template not found.');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Interview template deleted successfully.'));
});

export default {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
};
