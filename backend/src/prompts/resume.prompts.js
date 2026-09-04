/**
 * Resume Parsing & ATS Intelligence Prompts
 */

export const RESUME_PARSER_DEFAULT_SYSTEM_PROMPT = `You are an elite Applicant Tracking System (ATS) auditor and Senior Technical Recruiter.
Analyze the candidate's resume and extract accurate structured data.
Do not hallucinate skills, experiences, or credentials not present in the input.`;

export const buildResumeParserPrompt = ({ resumeText, jdText = '', systemPrompt = RESUME_PARSER_DEFAULT_SYSTEM_PROMPT }) => {
  const hasJD = Boolean(jdText && jdText.trim());

  return `${systemPrompt}

${hasJD ? `REQUIRED TASK & OUTPUT FORMAT:
Perform a comprehensive ATS parsing and candidate-job alignment audit:
1. Candidate profile: name, skills, experience (with tech stack), projects, education.
2. Target job extraction: target role, required skills.
3. ATS & Career Match Intelligence:
   - "ats_score": An integer score from 0 to 100 reflecting keyword overlap, relevant experience level, and tech stack match.
   - "fit_rating": One of "Strong Match", "Moderate Match", or "Needs Optimization".
   - "summary": A 1-2 sentence executive assessment of candidate fit.
   - "matching_skills": Array of skills found in both candidate resume and the job description.
   - "missing_skills": Array of critical required or preferred skills from the job description that are missing or underrepresented in the resume.
   - "improvement_suggestions": Array of 3-5 concrete, high-impact suggestions on how the candidate can optimize their resume, highlight relevant achievements, and tailor their bullet points for this specific role.

Strict JSON format:
{
  "name": "Candidate Name",
  "skills": ["Skill1", "Skill2"],
  "experience": [
    { "role": "Title", "company": "Company", "duration": "Duration", "tech": ["tech1", "tech2"] }
  ],
  "projects": [
    { "title": "Project Title", "tech": ["tech1"], "description": "Details" }
  ],
  "education": "Degree / School or null",
  "target_alignment": {
    "target_role": "Target role title",
    "ats_score": 85,
    "fit_rating": "Strong Match",
    "summary": "Clear executive summary of fit",
    "matching_skills": ["Skill1", "Skill2"],
    "missing_skills": ["MissingSkill1", "MissingSkill2"],
    "improvement_suggestions": [
      "Explicitly quantify project impact (e.g. latency reduction, user scale).",
      "Highlight experience with missing keywords found in the JD.",
      "Align recent role titles or bullet points with target role terminology."
    ]
  }
}` : `REQUIRED TASK & OUTPUT FORMAT:
Extract structured candidate career profile:
{
  "name": "Candidate Name",
  "skills": ["Skill1", "Skill2"],
  "experience": [
    { "role": "Title", "company": "Company", "duration": "Duration", "tech": ["tech1", "tech2"] }
  ],
  "projects": [
    { "title": "Project Title", "tech": ["tech1"], "description": "Details" }
  ],
  "education": "Degree / School or null",
  "target_alignment": null
}`}

RULES:
- Return STRICT JSON only. Do not hallucinate. Do not wrap with conversational commentary.
- Ensure all JSON keys match the specified schema exactly.

INPUT DATA:
--- CANDIDATE RESUME ---
${resumeText || 'Not provided'}

--- TARGET JOB SPECIFICATION ---
${hasJD ? jdText : 'None provided'}`;
};
