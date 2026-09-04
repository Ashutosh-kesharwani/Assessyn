/**
 * General AI Prompts
 * (Query Optimizer, Job Search Query Parser, and Live Socket Acknowledgments)
 */

export const buildQueryOptimizerPrompt = (userQuery) => {
  return `You are a semantic query optimizer for vector search.

Convert the user input into a precise, context-rich search query.

Rules:
- Focus on technical intent
- Expand abbreviations (e.g., JS -> JavaScript)
- Include relevant skills, tools, or concepts
- Keep it concise (1-2 lines max)

User Input:
${userQuery}

Output:
Optimized query text only.`;
};

export const buildQueryParserPrompt = (query, partial = {}) => {
  return `You are a job-search query parser. Extract structured fields from the user's query.

Rules:
- keywords : the job title and/or skills (string, lowercase, space-separated)
- location : city or region name (string | null). Do NOT include country names unless specified.
- remote   : true if query mentions remote/WFH/telecommute, else false (boolean)
- experience: minimum years of experience as an integer (number | null). Infer from "senior"->5, "junior"->0, etc.
- contract : "full_time" | "part_time" | "contract" | "permanent" | null
- salaryMin: integer (null if not mentioned)
- salaryMax: integer (null if not mentioned)
- sortBy   : "date" | "salary" | "relevance" | null
- sortDir  : "up" | "down" | null

Parse this job-search query:
"${query}"

Partial rule-based extraction for reference:
${JSON.stringify(partial, null, 2)}

Return ONLY valid JSON with exactly these keys:`;
};

export const buildSocketLiveAnswerPrompt = ({
  systemPromptText,
  questionText,
  expectedKeywords,
  answerText,
}) => {
  return `${systemPromptText || 'Act as an AI interviewer. Provide a brief, conversational, and direct 1-3 sentence acknowledgment.'}

Question: ${questionText}

Expected Keywords: ${expectedKeywords?.join(', ') || 'None'}

Candidate Answer: ${answerText || '(silence)'}
`;
};
