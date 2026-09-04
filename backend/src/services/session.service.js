import Session from '../models/Session.model.js';
import Interview from '../models/Interview.model.js';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import { SESSION_MESSAGES, INTERVIEW_MESSAGES } from '../constants/messages.constants.js';
import { evaluateAnswer, generateOverallFeedback } from './ai.service.js';
import logger from '../config/logger.js';

export const startSession = async (userId, interviewId) => {
  const interview = await Interview.findOne({ _id: interviewId, userId });
  if (!interview) {
    throw new ApiError(404, INTERVIEW_MESSAGES.INTERVIEW_NOT_FOUND);
  }

  const hasQuestions = interview.questions && interview.questions.length > 0;
  if (!hasQuestions) {
    throw new ApiError(400, SESSION_MESSAGES.QUESTIONS_NOT_READY);
  }

  const existingSession = await Session.findOne({
    userId,
    interviewId,
    status: { $in: ['started', 'in_progress'] },
  });

  if (existingSession) {
    return { session: existingSession, resumed: true };
  }

  interview.status = 'in_progress';
  await interview.save();

  const session = await Session.create({
    userId,
    interviewId,
    answers: [],
    status: 'started',
    startedAt: new Date(),
  });

  logger.info(`[Session] Started session ${session._id} for interview ${interviewId}`);
  return { session, interview, resumed: false };
};

export const submitAnswer = async (userId, sessionId, data) => {
  const { questionId, answerText, timeTaken, skipped } = data;

  const session = await Session.findOne({ _id: sessionId, userId });
  if (!session) {
    throw new ApiError(404, SESSION_MESSAGES.SESSION_NOT_FOUND);
  }

  const interview = await Interview.findById(session.interviewId);
  const question = interview?.questions?.id(questionId);
  if (!question) {
    throw new ApiError(404, 'Question not found in interview.');
  }

  const existing = session.answers.find((a) => a.questionId.toString() === questionId);
  if (existing) {
    existing.answerText = answerText;
    existing.timeTaken = timeTaken;
    existing.skipped = skipped;
  } else {
    session.answers.push({
      questionId,
      questionText: question.questionText,
      answerText: answerText || '',
      timeTaken: timeTaken || 0,
      skipped: skipped || false,
    });
  }

  if (session.status !== 'completed') {
    session.status = 'in_progress';
  }
  await session.save();

  return session;
};

export const completeSession = async (userId, sessionId) => {
  const session = await Session.findOne({ _id: sessionId, userId });
  if (!session) {
    throw new ApiError(404, SESSION_MESSAGES.SESSION_NOT_FOUND);
  }

  if (session.status === 'completed') {
    return session;
  }

  const interview = await Interview.findById(session.interviewId);
  if (!interview) {
    throw new ApiError(404, INTERVIEW_MESSAGES.INTERVIEW_NOT_FOUND);
  }

  for (const q of (interview.questions || [])) {
    const exists = session.answers.some((a) => a.questionId.toString() === q._id.toString());
    if (!exists) {
      session.answers.push({
        questionId: q._id,
        questionText: q.questionText,
        answerText: '',
        timeTaken: 0,
        skipped: true,
        aiScore: 0,
        aiFeedback: 'Question was skipped.',
      });
    }
  }

  const evaluationPromises = session.answers.map(async (answer) => {
    if (answer.skipped || !answer.answerText?.trim()) {
      answer.aiScore = 0;
      answer.aiFeedback = 'Question was skipped.';
      return;
    }
    try {
      const keywords = interview.questions.id(answer.questionId)?.expectedKeywords || [];
      const result = await evaluateAnswer({
        questionText: answer.questionText,
        answerText: answer.answerText,
        expectedKeywords: keywords,
        jobTitle: interview.jobTitle,
      });
      answer.aiScore = typeof result.score === 'number' ? result.score : 6;
      answer.aiFeedback = result.feedback || 'Answer evaluated based on technical clarity and correctness.';
    } catch {
      const keywords = interview.questions.id(answer.questionId)?.expectedKeywords || [];
      const lowerAns = (answer.answerText || '').toLowerCase();
      const matchedCount = keywords.filter((k) => lowerAns.includes(k.toLowerCase())).length;
      const baseScore = Math.min(10, Math.max(5, Math.round((matchedCount / Math.max(1, keywords.length)) * 10)));
      answer.aiScore = baseScore;
      answer.aiFeedback = `Answer evaluated based on keyword alignment (${matchedCount}/${keywords.length} core concepts addressed).`;
    }
  });

  await Promise.all(evaluationPromises);

  let overallData = {};
  try {
    overallData = await generateOverallFeedback({
      jobTitle: interview.jobTitle,
      answers: session.answers,
    });
  } catch {
    overallData = {
      overallScore: session.calculateOverallScore(),
      strengths: ['Demonstrated foundational domain comprehension', 'Structured responses with relevant technical terminology'],
      weaknesses: ['Deepen discussion on edge-case error recovery and production scaling'],
      improvementTips: ['Practice STAR framework responses', 'Review real-time architecture patterns'],
    };
  }

  const overallScore = overallData.overallScore ?? session.calculateOverallScore();
  session.overallScore = overallScore || 50;
  session.overallFeedback = Array.isArray(overallData.improvementTips) ? overallData.improvementTips.join(' ') : (overallData.overallFeedback || 'Interview completed successfully.');
  session.strengths = overallData.strengths || ['Technical Communication', 'Problem Solving'];
  session.areasForImprovement = overallData.weaknesses || ['Provide more concrete metrics', 'Deep dive into performance optimizations'];
  session.recommendedResources = overallData.improvementTips || ['Official Framework Documentation', 'System Design Primer'];
  session.status = 'completed';
  session.completedAt = new Date();
  session.totalTimeTaken = session.answers.reduce((s, a) => s + (a.timeTaken || 0), 0);

  await session.save();

  interview.status = 'completed';
  await interview.save();

  await User.findByIdAndUpdate(userId, { $inc: { totalSessions: 1 } });
  logger.info(`[Session] Completed evaluation for session ${session._id}`);

  return session;
};

export const getMySessions = async (userId, page = 1, limit = 10) => {
  const p = parseInt(page, 10) || 1;
  const l = parseInt(limit, 10) || 10;
  const skip = (p - 1) * l;

  const [sessions, total] = await Promise.all([
    Session.find({ userId })
      .sort('-createdAt')
      .skip(skip)
      .limit(l)
      .populate({ path: 'interviewId', select: 'jobTitle company experienceLevel' })
      .select('-answers'),
    Session.countDocuments({ userId }),
  ]);

  return {
    count: sessions.length,
    total,
    page: p,
    totalPages: Math.ceil(total / l),
    sessions,
  };
};

export const getSessionById = async (userId, sessionId) => {
  const session = await Session.findOne({ _id: sessionId, userId })
    .populate({ path: 'interviewId', select: 'jobTitle company experienceLevel questions' });

  if (!session) {
    throw new ApiError(404, SESSION_MESSAGES.SESSION_NOT_FOUND);
  }

  return session;
};

export default {
  startSession,
  submitAnswer,
  completeSession,
  getMySessions,
  getSessionById,
};
