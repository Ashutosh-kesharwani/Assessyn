import Interview from '../models/Interview.model.js';
import Resume from '../models/Resume.model.js';
import ApiError from '../utils/ApiError.js';
import { INTERVIEW_MESSAGES } from '../constants/messages.constants.js';
import { generateInterviewQuestions } from './ai.service.js';
import logger from '../config/logger.js';

export const createInterview = async (userId, data) => {
  const {
    jobTitle,
    jobDescription,
    company,
    experienceLevel,
    questionTypes,
    numberOfQuestions,
    resumeId,
  } = data;

  const interview = await Interview.create({
    userId,
    jobTitle,
    jobDescription,
    company,
    experienceLevel,
    questionTypes,
    numberOfQuestions,
    resumeId: resumeId || null,
    status: 'draft',
    generationStatus: 'pending',
  });

  return interview;
};

export const generateQuestions = async (userId, interviewId) => {
  const interview = await Interview.findOne({ _id: interviewId, userId });
  if (!interview) {
    throw new ApiError(404, INTERVIEW_MESSAGES.INTERVIEW_NOT_FOUND);
  }

  if (interview.generationStatus === 'generating') {
    throw new ApiError(400, INTERVIEW_MESSAGES.QUESTIONS_ALREADY_GENERATING);
  }

  let resumeText = null;
  if (interview.resumeId) {
    const resume = await Resume.findById(interview.resumeId).select('extractedText');
    resumeText = resume?.extractedText ?? null;
  }

  interview.generationStatus = 'generating';
  await interview.save();

  try {
    const questions = await generateInterviewQuestions({
      jobTitle: interview.jobTitle,
      jobDescription: interview.jobDescription,
      experienceLevel: interview.experienceLevel,
      numberOfQuestions: interview.numberOfQuestions,
      resumeText,
    });

    interview.questions = questions;
    interview.generationStatus = 'generated';
    interview.status = 'ready';
    await interview.save();

    logger.info(`[Interview] Questions generated for interview ${interview._id}`);
    return interview;
  } catch (err) {
    interview.generationStatus = 'failed';
    interview.generationError = err.message;
    await interview.save();
    logger.error(`[Interview] Question generation failed: ${err.message}`);
    throw new ApiError(500, `${INTERVIEW_MESSAGES.QUESTIONS_GENERATION_FAILED}: ${err.message}`);
  }
};

export const getMyInterviews = async (userId, page = 1, limit = 10) => {
  const p = parseInt(page, 10) || 1;
  const l = parseInt(limit, 10) || 10;
  const skip = (p - 1) * l;

  const [interviews, total] = await Promise.all([
    Interview.find({ userId })
      .sort('-createdAt')
      .skip(skip)
      .limit(l)
      .select('-questions'),
    Interview.countDocuments({ userId }),
  ]);

  return {
    count: interviews.length,
    total,
    page: p,
    totalPages: Math.ceil(total / l),
    interviews,
  };
};

export const getInterviewById = async (userId, interviewId) => {
  const interview = await Interview.findOne({ _id: interviewId, userId })
    .populate({ path: 'resumeId', select: 'originalName fileUrl' });

  if (!interview) {
    throw new ApiError(404, INTERVIEW_MESSAGES.INTERVIEW_NOT_FOUND);
  }

  return interview;
};

export const deleteInterview = async (userId, interviewId) => {
  const interview = await Interview.findOneAndDelete({ _id: interviewId, userId });
  if (!interview) {
    throw new ApiError(404, INTERVIEW_MESSAGES.INTERVIEW_NOT_FOUND);
  }

  return true;
};

export default {
  createInterview,
  generateQuestions,
  getMyInterviews,
  getInterviewById,
  deleteInterview,
};
