import SystemPrompt from '../models/SystemPrompt.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

// ─── Default Prompts Dictionary (Self-Healing Seeds) ─────────────
const DEFAULT_PROMPTS = [
  {
    category: 'interview',
    name: 'Interview Conversation Follow-Up',
    description: 'Dictates the persona and speech formatting of the AI Interviewer during candidate voice sessions.',
    content: 'Act as an AI interviewer. The candidate just responded to the following question. Provide a brief, conversational, and direct 1-3 sentence follow-up or acknowledgment based ONLY on their answer. Do not return JSON. Just speak as an interviewer naturally.',
  },
  {
    category: 'resume_parser',
    name: 'Structured Resume & JD Extractor',
    description: 'Parses unstructured candidate files and job descriptions into standard schema layouts.',
    content: `You are an expert resume and job description parser.

Extract structured data in strict JSON format.

From Resume:
- name
- skills (array)
- experience (array of objects: role, company, duration, tech)
- projects (array: title, tech stack, description)
- education

From Job Description:
- role
- required_skills (array)
- preferred_skills (array)
- responsibilities (array)

Rules:
- Do not hallucinate
- If missing, return empty array or null
- Keep output strictly JSON`,
  },
  {
    category: 'ats_scorer',
    name: 'Candidate Alignment Match Scorer',
    description: 'Scores the relevance match rate between candidates and active platform listings.',
    content: `You are a strict technical recruiter evaluating a candidate's resume against a job description.

Analyze the match rate, compute a score out of 100, identify skill gaps, and provide recommendations.

Format output as JSON:
{
  "score": Number,
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "suggestion": "Detailed evaluation text..."
}`,
  },
  {
    category: 'career_coach',
    name: 'Interactive Career Coach Advice',
    description: 'Provides suggestions, skill benchmarks, and learning recommendations.',
    content: 'You are an empathetic, expert career coach. Analyze the user\'s resume, mock interview performance, and profile to provide helpful career guidance, tips for technical improvement, and interview preparation action plans.',
  },
  {
    category: 'job_recommendation',
    name: 'Platform Job Recommendations',
    description: 'Recommends matching job openings based on resume details.',
    content: 'Analyze the user\'s profile and skills, then match them to available listings. Return matches in JSON format detailing why they are a strong match and suggestions on how to improve application success rate.',
  },
  {
    category: 'feedback_report',
    name: 'Interview Session Final Report Evaluator',
    description: 'Calculates the overall mock interview score and formats summaries.',
    content: `You are a senior interviewer providing a final interview report. Evaluate the candidate's answers, score their communication, technical depth, and speed.

Format output as a structured report:
{
  "scores": {
    "technical": Number,
    "communication": Number
  },
  "strongPoints": ["point1", "point2"],
  "weakPoints": ["point3", "point4"],
  "detailedFeedback": "Overall feedback text..."
}`,
  },
];

const seedDefaultPrompts = async () => {
  for (const def of DEFAULT_PROMPTS) {
    const exists = await SystemPrompt.findOne({ category: def.category });
    if (!exists) {
      await SystemPrompt.create({
        ...def,
        version: 1,
        history: [
          {
            version: 1,
            content: def.content,
            changeReason: 'Seed Default Preset',
          },
        ],
      });
    }
  }
};

// ─── GET /api/admin/prompts ────────────────────────────────────────
export const getAllPrompts = asyncHandler(async (req, res) => {
  await seedDefaultPrompts();

  const prompts = await SystemPrompt.find()
    .sort('name')
    .populate({ path: 'lastUpdatedBy', select: 'name email' });

  return res
    .status(200)
    .json(new ApiResponse(200, prompts, 'System prompts retrieved successfully.'));
});

// ─── GET /api/admin/prompts/:id ────────────────────────────────────
export const getPromptById = asyncHandler(async (req, res) => {
  const prompt = await SystemPrompt.findById(req.params.id)
    .populate({ path: 'lastUpdatedBy', select: 'name email' })
    .populate({ path: 'history.updatedBy', select: 'name email' });

  if (!prompt) {
    throw new ApiError(404, 'Prompt category not found.');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { prompt }, 'Prompt retrieved successfully.'));
});

// ─── PATCH /api/admin/prompts/:id ──────────────────────────────────
export const updatePrompt = asyncHandler(async (req, res) => {
  const { content, changeReason } = req.body;

  if (!content || !content.trim()) {
    throw new ApiError(400, 'Prompt content cannot be empty.');
  }

  const prompt = await SystemPrompt.findById(req.params.id);
  if (!prompt) {
    throw new ApiError(404, 'Prompt category not found.');
  }

  const adminId = req.admin?._id || req.user?._id;

  const prevHistoryItem = {
    version: prompt.version,
    content: prompt.content,
    changeReason: changeReason || 'Modified via Prompt Editor',
    updatedBy: adminId,
    updatedAt: new Date(),
  };

  prompt.history.push(prevHistoryItem);
  prompt.content = content;
  prompt.version += 1;
  prompt.lastUpdatedBy = adminId;

  await prompt.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { prompt }, 'Prompt updated successfully.'));
});

// ─── POST /api/admin/prompts/:id/restore ───────────────────────────
export const restorePromptVersion = asyncHandler(async (req, res) => {
  const { targetVersion } = req.body;

  if (!targetVersion) {
    throw new ApiError(400, 'Target version number is required.');
  }

  const prompt = await SystemPrompt.findById(req.params.id);
  if (!prompt) {
    throw new ApiError(404, 'Prompt category not found.');
  }

  const targetVerNum = parseInt(targetVersion, 10);
  if (prompt.version === targetVerNum) {
    throw new ApiError(400, 'Target version is already the active version.');
  }

  const historicItem = prompt.history.find((h) => h.version === targetVerNum);
  if (!historicItem && targetVerNum !== 1) {
    throw new ApiError(404, 'Specified version not found in history logs.');
  }

  const adminId = req.admin?._id || req.user?._id;

  const activeHistory = {
    version: prompt.version,
    content: prompt.content,
    changeReason: `Reverted active prompt back to version v${targetVersion}`,
    updatedBy: adminId,
    updatedAt: new Date(),
  };
  prompt.history.push(activeHistory);

  prompt.content = historicItem ? historicItem.content : prompt.history[0].content;
  prompt.version += 1;
  prompt.lastUpdatedBy = adminId;

  await prompt.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { prompt },
      `Successfully restored prompt to version v${targetVersion}. Active version is now v${prompt.version}.`
    )
  );
});

export default {
  getAllPrompts,
  getPromptById,
  updatePrompt,
  restorePromptVersion,
};
