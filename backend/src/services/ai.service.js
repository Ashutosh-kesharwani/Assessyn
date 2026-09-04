import mongoose from 'mongoose';
import logger from '../config/logger.js';
import { extractContextViaRAG } from './rag.service.js';
import SystemPrompt from '../models/SystemPrompt.model.js';
import {
  generateWithFallback,
  generateStreamWithFallback,
  extractCleanJSON,
} from './ai/modelRouter.service.js';

import {
  // Resume prompts
  RESUME_PARSER_DEFAULT_SYSTEM_PROMPT,
  buildResumeParserPrompt,

  // Interview prompts
  INTERVIEW_SYSTEM_PROMPT,
  buildInterviewQuestionsPrompt,
  buildSeniorTechnicalQuestionsPrompt,
  buildDirectQuestionsPrompt,

  // Evaluation prompts
  EVALUATION_DEFAULT_TEMPLATE,
  FEEDBACK_REPORT_DEFAULT_TEMPLATE,
  buildStrictEvaluationPrompt,
  buildFollowUpQuestionPrompt,
  buildFinalReportPrompt,
  buildGroundingValidationPrompt,

  // Pro Career prompts
  buildResumeRestructurePrompt,
  buildTailoredProjectsPrompt,
  buildTargetedQuestionBankPrompt,
  buildCareerRoadmapPrompt,
  buildProChatAdvisorPrompt,

  // General prompts
  buildQueryOptimizerPrompt,
  buildQueryParserPrompt,
} from '../prompts/index.js';

// Backward compatibility alias for any caller expecting generateWithGeminiFallback
export const generateWithGeminiFallback = generateWithFallback;
export { extractCleanJSON };

const getActivePrompt = async (category, defaultVal) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return defaultVal;
    }
    const promptDoc = await SystemPrompt.findOne({ category });
    return promptDoc ? promptDoc.content : defaultVal;
  } catch {
    return defaultVal;
  }
};

const formatPrompt = (template, vars) => {
  return template.replace(/\$\{(\w+)\}/g, (match, key) => {
    return vars[key] !== undefined ? vars[key] : match;
  });
};

// ─── 1. Interview Question Generation ──────────────────────────────────────────

export const generateInterviewQuestions = async ({
  jobTitle,
  jobDescription,
  experienceLevel,
  numberOfQuestions = 10,
  resumeText = null,
}) => {
  const optimizedContext = await extractContextViaRAG(resumeText, jobDescription);

  const technicalCount = Math.max(1, Math.round((numberOfQuestions * 2) / 3));
  const behavioralCount = Math.max(1, numberOfQuestions - technicalCount);

  const systemPrompt = await getActivePrompt('interview_questions', INTERVIEW_SYSTEM_PROMPT);
  const userPrompt = buildInterviewQuestionsPrompt({
    jobTitle,
    experienceLevel,
    optimizedContext,
    technicalCount,
    behavioralCount,
    systemPrompt,
  });

  const response = await generateWithFallback({
    contents: userPrompt,
    config: {
      temperature: 0.3,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  });

  const content = response.text;
  if (!content) throw new Error('No response from AI model.');

  let parsed;
  try {
    parsed = extractCleanJSON(content);
  } catch (err) {
    logger.warn(`[Interview] Standard JSON parse failed, attempting regex pattern extraction: ${err.message}`);
    // Regex recovery: extract questionText matches directly from text
    const qs = [];
    const qRegex = /"questionText"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/gi;
    let match;
    while ((match = qRegex.exec(content)) !== null) {
      const qText = match[1].replace(/\\"/g, '"').replace(/\\n/g, ' ').trim();
      if (qText) {
        qs.push({
          questionText: qText,
          difficulty: 'medium',
          expectedKeywords: [],
        });
      }
    }
    if (qs.length > 0) {
      const splitIndex = Math.max(1, Math.round((qs.length * 2) / 3));
      parsed = {
        technical: qs.slice(0, splitIndex),
        behavioral: qs.slice(splitIndex),
      };
    }
  }

  const technicalQs = Array.isArray(parsed?.technical) ? parsed.technical : [];
  const behavioralQs = Array.isArray(parsed?.behavioral) ? parsed.behavioral : [];

  const allQuestions = [];

  technicalQs.forEach((q) => {
    const text = q.questionText || q.question || '';
    if (text) {
      allQuestions.push({
        questionText: text,
        category: 'technical',
        difficulty: q.difficulty || 'medium',
        expectedKeywords: Array.isArray(q.expectedKeywords) ? q.expectedKeywords : [],
      });
    }
  });

  behavioralQs.forEach((q) => {
    const text = q.questionText || q.question || '';
    if (text) {
      allQuestions.push({
        questionText: text,
        category: 'behavioral',
        difficulty: q.difficulty || 'medium',
        expectedKeywords: Array.isArray(q.expectedKeywords) ? q.expectedKeywords : [],
      });
    }
  });

  // Resilient fallback: ensure interview generation never fails completely
  if (!allQuestions.length) {
    logger.warn(`[Interview] AI returned empty questions list, generating role-calibrated fallback questions for ${jobTitle}`);
    allQuestions.push(
      {
        questionText: `Can you walk us through your technical background and key project contributions as a ${jobTitle}?`,
        category: 'technical',
        difficulty: 'easy',
        expectedKeywords: [jobTitle, 'projects', 'technical skills', 'architecture'],
      },
      {
        questionText: `Describe a complex technical issue or bug you diagnosed in a past project. What was the root cause and how did you resolve it?`,
        category: 'technical',
        difficulty: 'medium',
        expectedKeywords: ['debugging', 'root cause', 'optimization', 'problem solving'],
      },
      {
        questionText: `Using the STAR method, describe a situation where you had to collaborate closely with cross-functional stakeholders or team members under tight deadlines.`,
        category: 'behavioral',
        difficulty: 'medium',
        expectedKeywords: ['collaboration', 'communication', 'deadlines', 'STAR method'],
      }
    );
  }

  const trimmed = allQuestions.slice(0, numberOfQuestions);
  return trimmed.map((q, i) => ({ ...q, order: i + 1 }));
};

// ─── 2. Candidate Answer Evaluation & Feedback ────────────────────────────────

export const evaluateAnswer = async ({ questionText, answerText, expectedKeywords, jobTitle }) => {
  const rawTemplate = await getActivePrompt('ats_scorer', EVALUATION_DEFAULT_TEMPLATE);
  const prompt = formatPrompt(rawTemplate, {
    jobTitle,
    questionText,
    expectedKeywordsText: expectedKeywords.join(', '),
    answerText: answerText || '(No answer provided)',
  });

  const response = await generateWithFallback({
    contents: prompt,
    config: {
      temperature: 0.4,
      responseMimeType: 'application/json',
    },
  });

  return extractCleanJSON(response.text) || {};
};

export const generateOverallFeedback = async ({ jobTitle, answers }) => {
  const summary = answers
    .map((a, i) => `Q${i + 1}: ${a.questionText}\nScore: ${a.aiScore}/10\nAnswer: ${a.answerText?.slice(0, 200)}`)
    .join('\n\n');

  const rawTemplate = await getActivePrompt('feedback_report', FEEDBACK_REPORT_DEFAULT_TEMPLATE);
  const prompt = formatPrompt(rawTemplate, { jobTitle, summary });

  const response = await generateWithFallback({
    contents: prompt,
    config: {
      temperature: 0.5,
      responseMimeType: 'application/json',
    },
  });

  return extractCleanJSON(response.text) || {};
};

// ─── 3. Resume & Job Description Parser with ATS Scoring ──────────────────────

export const parseResumeAndJD = async (resumeText, jdText = '') => {
  const systemPrompt = await getActivePrompt('resume_parser', RESUME_PARSER_DEFAULT_SYSTEM_PROMPT);
  const userPrompt = buildResumeParserPrompt({
    resumeText,
    jdText,
    systemPrompt,
  });

  const response = await generateWithFallback({
    contents: userPrompt,
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const content = response.text;
  if (!content) throw new Error('No response from AI parser.');

  const parsed = extractCleanJSON(content) || {};

  // Normalize structure (whether flat or nested)
  const base = parsed.resume && typeof parsed.resume === 'object' ? parsed.resume : parsed;
  const targetAlignment = parsed.target_alignment || base.target_alignment || null;

  return {
    name: base.name || '',
    skills: Array.isArray(base.skills) ? base.skills : [],
    experience: Array.isArray(base.experience) ? base.experience : [],
    projects: Array.isArray(base.projects) ? base.projects : [],
    education: base.education || null,
    target_alignment: targetAlignment,
    ...base,
    ...(targetAlignment ? { target_alignment: targetAlignment } : {}),
  };
};

// ─── 4. Senior Technical & Direct Questions ───────────────────────────────────

export const generateSeniorTechnicalQuestions = async ({
  retrievedChunks,
  parsedResumeData,
  parsedJdData,
}) => {
  const userPrompt = buildSeniorTechnicalQuestionsPrompt({
    retrievedChunks,
    parsedResumeData,
    parsedJdData,
  });

  const response = await generateWithFallback({
    contents: userPrompt,
    config: {
      temperature: 0.6,
    },
  });

  return response.text?.trim() || 'Failed to generate questions.';
};

export const evaluateStrictAnswer = async ({ retrievedChunks, question, answer }) => {
  const userPrompt = buildStrictEvaluationPrompt({ retrievedChunks, question, answer });
  const response = await generateWithFallback({
    contents: userPrompt,
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  return extractCleanJSON(response.text) || {};
};

export const generateFollowUpQuestion = async ({ retrievedChunks, question, answer }) => {
  const userPrompt = buildFollowUpQuestionPrompt({ retrievedChunks, question, answer });
  const response = await generateWithFallback({
    contents: userPrompt,
    config: {
      temperature: 0.5,
    },
  });

  return response.text?.trim() || 'No follow-up generated.';
};

export const generateFinalEvaluationReport = async (allEvaluations) => {
  const userPrompt = buildFinalReportPrompt(allEvaluations);
  const response = await generateWithFallback({
    contents: userPrompt,
    config: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  return extractCleanJSON(response.text) || {};
};

export const validateGrounding = async ({ retrievedChunks, modelOutput }) => {
  const userPrompt = buildGroundingValidationPrompt({ retrievedChunks, modelOutput });
  const response = await generateWithFallback({
    contents: userPrompt,
    config: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  return extractCleanJSON(response.text) || {};
};

export const generateTopicQuestions = async ({ resumeText, jobDescription, topic, parsedResumeData, parsedJdData }) => {
  const context = await extractContextViaRAG(resumeText, jobDescription);
  return generateSeniorTechnicalQuestions({
    retrievedChunks: (topic ? `Topic Focus: ${topic}\n\n` : '') + context,
    parsedResumeData,
    parsedJdData,
  });
};

export const generateQuestionsDirect = async (jobTitle, jobDescription) => {
  if (!jobTitle || !jobDescription) {
    throw new Error('Job title and job description are required.');
  }

  const userPrompt = buildDirectQuestionsPrompt({ jobTitle, jobDescription });
  const response = await generateWithFallback({
    contents: userPrompt,
    config: {
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  });

  const content = response.text;
  if (!content) throw new Error('Failed to generate questions.');

  try {
    const parsed = extractCleanJSON(content);
    return parsed?.questions || [];
  } catch (err) {
    logger.error('Failed to parse direct questions JSON:', err);
    throw new Error('Failed to parse questions response.');
  }
};

// ─── 5. Pro Career Suite Central Operations ───────────────────────────────────

export const restructureResumeWithAI = async ({ resumeText, jobDescription }) => {
  const prompt = buildResumeRestructurePrompt({ resumeText, jobDescription });
  const response = await generateWithFallback({
    contents: prompt,
    config: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  const parsed = extractCleanJSON(response.text);
  return {
    ...parsed,
    meta: { provider: 'Assessyn AI Core', modelUsed: 'gemini-3.5-flash / fallback' },
  };
};

export const generateTailoredProjectsWithAI = async ({ jobDescription, resumeText = '' }) => {
  const prompt = buildTailoredProjectsPrompt({ jobDescription, resumeText });
  const response = await generateWithFallback({
    contents: prompt,
    config: {
      temperature: 0.4,
      responseMimeType: 'application/json',
    },
  });

  const parsed = extractCleanJSON(response.text);
  return {
    projects: parsed?.projects || parsed,
    meta: { provider: 'Assessyn AI Core', modelUsed: 'gemini-3.5-flash / fallback' },
  };
};

export const generateTargetedQuestionBankWithAI = async ({
  jobDescription,
  resumeText = '',
  experienceLevel = 'Mid-Senior',
  questionCount = 6,
}) => {
  const prompt = buildTargetedQuestionBankPrompt({
    jobDescription,
    resumeText,
    experienceLevel,
    questionCount,
  });

  const response = await generateWithFallback({
    contents: prompt,
    config: {
      temperature: 0.5,
      responseMimeType: 'application/json',
    },
  });

  const parsed = extractCleanJSON(response.text);
  return {
    questions: parsed?.questions || parsed,
    meta: { provider: 'Assessyn AI Core', modelUsed: 'gemini-3.5-flash / fallback' },
  };
};

export const generateCareerRoadmapWithAI = async ({
  targetRole = 'Senior Software Engineer',
  jobDescription = '',
  resumeText = '',
  durationDays = 30,
}) => {
  const prompt = buildCareerRoadmapPrompt({
    targetRole,
    jobDescription,
    resumeText,
    durationDays,
  });

  const response = await generateWithFallback({
    contents: prompt,
    config: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  const parsed = extractCleanJSON(response.text);
  return {
    ...parsed,
    roadmap: parsed?.roadmap || parsed,
    meta: { provider: 'Assessyn AI Core', modelUsed: 'gemini-3.5-flash / fallback' },
  };
};

export const proCareerChatFollowUp = async ({
  toolType,
  toolContext,
  conversationHistory = [],
  message,
}) => {
  const prompt = buildProChatAdvisorPrompt({
    toolType,
    toolContext,
    conversationHistory,
    message,
  });

  const response = await generateWithFallback({
    contents: prompt,
    config: {
      temperature: 0.5,
    },
  });

  return {
    reply: response.text?.trim() || 'I was unable to generate a response. Please rephrase your query.',
    meta: { provider: 'Assessyn AI Core' },
  };
};

// ─── 6. General Utility Operations ────────────────────────────────────────────

export const optimizeQuery = async (userQuery) => {
  if (!userQuery || !userQuery.trim()) return '';

  const prompt = buildQueryOptimizerPrompt(userQuery);
  try {
    const response = await generateWithFallback({
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 256,
      },
    });

    const content = response.text?.trim();
    return content ? content.replace(/^["']|["']$/g, '') : userQuery;
  } catch (err) {
    logger.warn('[Query Optimizer Error]: ' + (err?.message || err));
    return userQuery;
  }
};

export const parseJobQueryWithLLM = async (query, partial = {}) => {
  const prompt = buildQueryParserPrompt(query, partial);
  const response = await generateWithFallback({
    contents: prompt,
    config: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  return extractCleanJSON(response.text) || {};
};

export default {
  generateInterviewQuestions,
  evaluateAnswer,
  generateOverallFeedback,
  parseResumeAndJD,
  optimizeQuery,
  generateSeniorTechnicalQuestions,
  evaluateStrictAnswer,
  generateFollowUpQuestion,
  generateFinalEvaluationReport,
  validateGrounding,
  generateTopicQuestions,
  generateQuestionsDirect,
  generateWithGeminiFallback,
  generateWithFallback,
  generateStreamWithFallback,
  restructureResumeWithAI,
  generateTailoredProjectsWithAI,
  generateTargetedQuestionBankWithAI,
  generateCareerRoadmapWithAI,
  proCareerChatFollowUp,
  parseJobQueryWithLLM,
};
