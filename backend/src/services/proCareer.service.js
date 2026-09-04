import Job from '../models/Job.model.js';
import Resume from '../models/Resume.model.js';
import logger from '../config/logger.js';
import aiService from './ai.service.js';

/**
 * Helper to resolve resume text from either direct text or a user's Resume Dossier ID
 */
const resolveResumeText = async (userId, resumeId, directResumeText = '') => {
  if (resumeId && userId) {
    try {
      const resume = await Resume.findOne({ _id: resumeId, userId });
      if (resume?.extractedText) {
        return resume.extractedText;
      }
    } catch (err) {
      logger.warn(`[ProCareer] Failed to fetch resume ${resumeId} for user ${userId}: ${err.message}`);
    }
  }
  return directResumeText;
};

/**
 * 1. AI Resume Restructurer & JD Optimizer
 */
export async function restructureResumeWithAI({ userId, resumeId, resumeText, jobDescription }) {
  const effectiveResumeText = await resolveResumeText(userId, resumeId, resumeText);
  return aiService.restructureResumeWithAI({
    resumeText: effectiveResumeText,
    jobDescription,
  });
}

/**
 * 2. JD-Tailored Portfolio Project Architecture Generator
 */
export async function generateTailoredProjectsWithAI({ userId, resumeId, resumeText, jobDescription }) {
  const effectiveResumeText = await resolveResumeText(userId, resumeId, resumeText);
  return aiService.generateTailoredProjectsWithAI({
    jobDescription,
    resumeText: effectiveResumeText,
  });
}

/**
 * 3. Targeted Interview Question & Solution Bank
 */
export async function generateTargetedQuestionBankWithAI({
  userId,
  resumeId,
  resumeText,
  jobDescription,
  experienceLevel = 'Mid-Senior',
  questionCount = 6,
}) {
  const effectiveResumeText = await resolveResumeText(userId, resumeId, resumeText);
  return aiService.generateTargetedQuestionBankWithAI({
    jobDescription,
    resumeText: effectiveResumeText,
    experienceLevel,
    questionCount,
  });
}

/**
 * 4. Dynamic AI Career & Prep Roadmap (Flexible Duration)
 */
export async function generateCareerRoadmapWithAI({
  userId,
  resumeId,
  currentSkills,
  targetRole = 'Senior Software Engineer',
  jobDescription = '',
  durationDays = 30,
}) {
  let effectiveSkills = currentSkills;
  if (resumeId && userId) {
    try {
      const resume = await Resume.findOne({ _id: resumeId, userId });
      if (resume?.parsedData?.skills?.length) {
        effectiveSkills = resume.parsedData.skills.join(', ');
      } else if (resume?.extractedText) {
        effectiveSkills = resume.extractedText.slice(0, 1000);
      }
    } catch {
      // Ignore fallback
    }
  }

  return aiService.generateCareerRoadmapWithAI({
    targetRole,
    jobDescription,
    resumeText: effectiveSkills || 'Software Engineering / Full Stack',
    durationDays,
  });
}

/**
 * 5. Interactive Pro Career Chat Advisor Follow-Up
 */
export async function chatWithProAdvisor({ toolType, toolContext, conversationHistory, message }) {
  return aiService.proCareerChatFollowUp({
    toolType,
    toolContext,
    conversationHistory,
    message,
  });
}

/**
 * 6. Time-Filtered Live Job Radar
 */
export async function getRadarJobsFromDB({ freshness = 'all', searchQuery = '', limit = 20 }) {
  const now = new Date();
  let dateQuery = {};

  if (freshness === 'today') {
    const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    dateQuery = { createdAt: { $gte: past24h } };
  } else if (freshness === '2days') {
    const past48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    dateQuery = { createdAt: { $gte: past48h } };
  } else if (freshness === '4days') {
    const past4d = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    dateQuery = { createdAt: { $gte: past4d } };
  } else if (freshness === '7days') {
    const past7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    dateQuery = { createdAt: { $gte: past7d } };
  }

  const filter = { ...dateQuery };
  if (searchQuery) {
    filter.$or = [
      { title: { $regex: searchQuery, $options: 'i' } },
      { company: { $regex: searchQuery, $options: 'i' } },
      { skills: { $in: [new RegExp(searchQuery, 'i')] } },
    ];
  }

  try {
    const jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
    return jobs;
  } catch (err) {
    logger.warn('Failed to query DB jobs for radar: ' + err.message);
    return [];
  }
}

export default {
  restructureResumeWithAI,
  generateTailoredProjectsWithAI,
  generateTargetedQuestionBankWithAI,
  generateCareerRoadmapWithAI,
  chatWithProAdvisor,
  getRadarJobsFromDB,
};
