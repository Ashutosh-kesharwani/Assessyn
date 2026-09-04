/**
 * Live Answer Evaluation & Feedback Prompts
 */

export const EVALUATION_DEFAULT_TEMPLATE = `Act as an interviewer evaluating a candidate's response.

Job Title: \${jobTitle}
Question: \${questionText}
Expected Keywords Context: \${expectedKeywordsText}
Candidate's Answer: \${answerText}

Evaluate the candidate's answer strictly based on:
1. Correctness
2. Clarity
3. Depth

Return valid JSON exactly in this format:
{
  "score": <number 1-10>,
  "feedback": "<constructive feedback string explaining the evaluation based on correctness, clarity, and depth>"
}`;

export const FEEDBACK_REPORT_DEFAULT_TEMPLATE = `You are a senior interviewer providing a final interview report.
Be professional and concise.

Job Title: \${jobTitle}
Interview Summary:
\${summary}

Respond with valid JSON exactly in this format:
{
  "overallScore": <number 1-100>,
  "strengths": ["<point 1>", "<point 2>"],
  "weaknesses": ["<point 1>", "<point 2>"],
  "improvementTips": ["<point 1>", "<point 2>"]
}`;

export const buildStrictEvaluationPrompt = ({ retrievedChunks, question, answer }) => {
  return `You are a strict technical interviewer.

Evaluate the candidate's answer using ONLY the given context.

Context:
${retrievedChunks}

Question:
${question}

Candidate Answer:
${answer}

Return JSON exactly as:
{
  "score": (0-10),
  "correctness": "low | medium | high",
  "strengths": [],
  "weaknesses": [],
  "missed_concepts": [],
  "improvement_suggestions": []
}`;
};

export const buildFollowUpQuestionPrompt = ({ retrievedChunks, question, answer }) => {
  return `You are a technical interviewer.

Generate a follow-up question based on the previous interaction. Focus on gaps and depth.

Context:
${retrievedChunks}

Previous Question:
${question}

Candidate Answer:
${answer}

Output: Single follow-up question.`;
};

export const buildFinalReportPrompt = (allEvaluations) => {
  return `You are a senior interviewer.

Generate a final evaluation report based on the provided session data.

Evaluation Data:
${JSON.stringify(allEvaluations, null, 2)}

Return JSON exactly as:
{
  "overall_score": (0-10),
  "skill_breakdown": [
    { "skill": "", "score": 0-10 }
  ],
  "key_strengths": [],
  "key_weaknesses": [],
  "hire_decision": "yes | no | borderline",
  "improvement_plan": [
    "step 1",
    "step 2"
  ]
}`;
};

export const buildGroundingValidationPrompt = ({ retrievedChunks, modelOutput }) => {
  return `You are a validation system. Check whether the response is fully supported by the context.

Context:
${retrievedChunks}

Response:
${modelOutput}

Return JSON exactly as:
{
  "grounded": true|false,
  "unsupported_claims": [],
  "reason": ""
}`;
};
