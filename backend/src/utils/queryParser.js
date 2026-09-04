import { buildQueryParserPrompt } from '../prompts/index.js';
import { generateWithFallback, extractCleanJSON } from '../services/ai/modelRouter.service.js';

// ─── Rule Tables ──────────────────────────────────────────────────────────────

const CONTRACT_PATTERNS = [
  { regex: /\b(full[\s-]?time)\b/i, value: 'full_time' },
  { regex: /\b(part[\s-]?time)\b/i, value: 'part_time' },
  { regex: /\b(contract|freelance|contractor)\b/i, value: 'contract' },
  { regex: /\b(permanent|perm)\b/i, value: 'permanent' },
];

const SORT_PATTERNS = [
  { regex: /\b(latest|newest|recent)\b/i, sortBy: 'date', sortDir: 'down' },
  { regex: /\b(oldest|earliest)\b/i, sortBy: 'date', sortDir: 'up' },
  { regex: /\b(highest\s+salary|best\s+paid)\b/i, sortBy: 'salary', sortDir: 'down' },
  { regex: /\b(lowest\s+salary|cheapest)\b/i, sortBy: 'salary', sortDir: 'up' },
];

const SALARY_RANGE_RE = /[£$€]?\s*(\d[\d,]*)\s*k?\s*(?:to|[-–])\s*[£$€]?\s*(\d[\d,]*)\s*k?\b/i;
const SALARY_MIN_RE = /[£$€]?\s*(\d[\d,]*)\s*k\s*[+]/i;
const SALARY_EXACT_RE = /[£$€]\s*(\d[\d,]+)/i;

const EXPERIENCE_RE = /\b(?:minimum\s+)?(\d{1,2})\s*[+]?\s*(?:years?|yrs?)\b(?:\s+(?:of\s+)?(?:experience|exp))?\b/i;

const LOCATION_RE = /\b(?:in|at|near|from)\s+([A-Z][a-zA-Z\s,]{2,30}?)(?=\s*,|\s+(?:full|part|contract|perm|permanent|\d|£|\$|€|remote|latest|newest|recent)|$)/i;
const REMOTE_RE = /\b(remote(?:ly)?|work\s+from\s+home|wfh|telecommute)\b/i;

const LEVEL_EXPERIENCE_MAP = [
  { regex: /\bjunior\b/i, years: 0 },
  { regex: /\bmid[\s-]?level\b/i, years: 3 },
  { regex: /\bsenior\b/i, years: 5 },
  { regex: /\blead\b/i, years: 7 },
  { regex: /\bstaff\b/i, years: 8 },
  { regex: /\bprincipal\b/i, years: 10 },
  { regex: /\bdirector\b/i, years: 12 },
];

function parseSalary(raw, isK = false) {
  const num = parseFloat(raw.replace(/[,\s]/g, ''));
  if (isNaN(num)) return null;
  return isK || num < 1000 ? Math.round(num * 1000) : Math.round(num);
}

function cleanText(str) {
  return str
    .replace(/^[,\s]+|[,\s]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function ruleBasedParse(raw) {
  if (!raw || typeof raw !== 'string') return {};

  let text = raw.trim();
  const out = {
    keywords: null,
    location: null,
    remote: false,
    experience: null,

    contract: null,
    salaryMin: null,
    salaryMax: null,
    sortBy: null,
    sortDir: null,
  };

  for (const { regex, value } of CONTRACT_PATTERNS) {
    if (regex.test(text)) {
      out.contract = value;
      text = text.replace(regex, '').trim();
      break;
    }
  }

  for (const { regex, sortBy, sortDir } of SORT_PATTERNS) {
    if (regex.test(text)) {
      out.sortBy = sortBy;
      out.sortDir = sortDir;
      text = text.replace(regex, '').trim();
      break;
    }
  }

  const rangeM = SALARY_RANGE_RE.exec(text);
  if (rangeM) {
    const isK = /k/i.test(rangeM[0]);
    out.salaryMin = parseSalary(rangeM[1], isK);
    out.salaryMax = parseSalary(rangeM[2], isK);
    text = text.replace(SALARY_RANGE_RE, '').trim();
  } else {
    const minM = SALARY_MIN_RE.exec(text);
    if (minM) {
      out.salaryMin = parseSalary(minM[1], true);
      text = text.replace(SALARY_MIN_RE, '').trim();
    } else {
      const exactM = SALARY_EXACT_RE.exec(text);
      if (exactM) {
        out.salaryMin = parseSalary(exactM[1]);
        text = text.replace(SALARY_EXACT_RE, '').trim();
      }
    }
  }

  const expM = EXPERIENCE_RE.exec(text);
  if (expM) {
    out.experience = parseInt(expM[1], 10);
    text = text.replace(EXPERIENCE_RE, '').trim();
  }

  if (REMOTE_RE.test(text)) {
    out.remote = true;
    text = text.replace(REMOTE_RE, '').trim();
  }

  const locM = LOCATION_RE.exec(text);
  if (locM) {
    out.location = cleanText(locM[1]);
    text = text.replace(LOCATION_RE, '').trim();
  }

  if (out.experience === null) {
    for (const { regex, years } of LEVEL_EXPERIENCE_MAP) {
      if (regex.test(text)) {
        out.experience = years;
        break;
      }
    }
  }

  const keywords = cleanText(text);
  if (keywords) out.keywords = keywords;

  return out;
}

export const AMBIGUITY_THRESHOLD = 35;

export function ambiguityScore(raw, parsed) {
  const words = raw.trim().split(/\s+/);
  let score = 0;

  if (words.length <= 2) score += 30;
  if (!parsed.keywords) score += 20;
  if (!parsed.location && !parsed.remote) score += 20;
  if (/[\/\\]/.test(raw)) score += 15;
  if (/[()[\]{}]/.test(raw)) score += 10;

  const commaClauses = raw.split(',').length - 1;
  if (commaClauses >= 2 && !parsed.contract && !parsed.salaryMin) score += 10;

  const structuredFields = ['contract', 'salaryMin', 'salaryMax', 'sortBy', 'experience']
    .filter((k) => parsed[k] !== null && parsed[k] !== undefined);
  if (structuredFields.length > 0) score -= 20;

  return Math.max(0, Math.min(100, score));
}

async function llmFallbackParse(query, partial = {}) {
  const userPrompt = buildQueryParserPrompt(query, partial);

  try {
    const response = await generateWithFallback({
      contents: userPrompt,
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const content = response.text;
    if (!content) throw new Error('Empty LLM response');

    const llmOut = extractCleanJSON(content) || {};
    return mergeOutputs(partial, llmOut);
  } catch (err) {
    console.warn('[queryParser] LLM fallback failed, using rule-based result:', err.message);
    return { ...partial, _llmFailed: true };
  }
}

function mergeOutputs(rules, llm) {
  const KEYS = ['keywords', 'location', 'remote', 'experience', 'contract', 'salaryMin', 'salaryMax', 'sortBy', 'sortDir'];
  const merged = {};

  for (const key of KEYS) {
    const rVal = rules[key];
    const lVal = llm[key];

    if (rVal !== null && rVal !== undefined && rVal !== false) {
      merged[key] = rVal;
    } else if (lVal !== null && lVal !== undefined) {
      merged[key] = lVal;
    } else {
      merged[key] = rVal ?? null;
    }
  }

  return merged;
}

export async function parseQuery(query, { forceLlm = false, disableLlm = false } = {}) {
  if (!query || typeof query !== 'string') {
    return _withMeta({}, 0, 'rule-based');
  }

  const ruleResult = ruleBasedParse(query);
  const aScore = ambiguityScore(query, ruleResult);

  const needsLlm = !disableLlm && (forceLlm || aScore >= AMBIGUITY_THRESHOLD);

  let finalResult;
  let parserUsed;

  if (needsLlm) {
    const llmResult = await llmFallbackParse(query, ruleResult);
    finalResult = llmResult;
    parserUsed = 'llm-fallback';
  } else {
    finalResult = ruleResult;
    parserUsed = 'rule-based';
  }

  return _withMeta(finalResult, aScore, parserUsed);
}

function _withMeta(parsed, aScore, parser) {
  const where = parsed.remote
    ? 'remote'
    : (parsed.location ?? null);

  return {
    keywords: parsed.keywords ?? null,
    location: parsed.location ?? null,
    remote: parsed.remote ?? false,
    experience: parsed.experience ?? null,

    what: parsed.keywords ?? '',
    where,
    contract: parsed.contract ?? null,
    salaryMin: parsed.salaryMin ?? null,
    salaryMax: parsed.salaryMax ?? null,
    sortBy: parsed.sortBy ?? null,
    sortDir: parsed.sortDir ?? null,

    _parser: parser,
    _ambiguityScore: aScore,
  };
}

export function parseQuerySync(query) {
  const ruleResult = ruleBasedParse(query);
  const aScore = ambiguityScore(query, ruleResult);
  return _withMeta(ruleResult, aScore, 'rule-based');
}

export async function mergeWithParsed(explicitParams, nlQuery, options = {}) {
  if (!nlQuery) return explicitParams;

  const parsed = await parseQuery(nlQuery, options);

  const { _parser, _ambiguityScore, keywords, location, remote, experience, ...adzunaFields } = parsed;

  const merged = {
    ...adzunaFields,
    ...Object.fromEntries(
      Object.entries(explicitParams).filter(([, v]) => v !== undefined && v !== '')
    ),
  };

  merged._queryMeta = { parser: _parser, ambiguityScore: _ambiguityScore };

  return merged;
}

export default {
  parseQuery,
  parseQuerySync,
  mergeWithParsed,
  ambiguityScore,
  AMBIGUITY_THRESHOLD,
};
