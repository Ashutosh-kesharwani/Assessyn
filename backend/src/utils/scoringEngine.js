function tokenize(str) {
  if (!str) return [];
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function keywordScore(job, what) {
  if (!what) return 0.5;

  const queryTokens = tokenize(what);
  if (queryTokens.length === 0) return 0.5;

  const titleTokens  = new Set(tokenize(job.title));
  const skillTokens  = new Set(
    Array.isArray(job.skills)
      ? job.skills.flatMap((s) => tokenize(s))
      : []
  );
  const descTokens   = new Set(tokenize(job.description?.slice(0, 2000)));

  let weightedMatches = 0;
  const WEIGHT_TITLE  = 3;
  const WEIGHT_SKILL  = 2;
  const WEIGHT_DESC   = 1;
  const MAX_WEIGHT    = WEIGHT_TITLE + WEIGHT_SKILL + WEIGHT_DESC;

  for (const token of queryTokens) {
    let w = 0;
    if (titleTokens.has(token))  w += WEIGHT_TITLE;
    if (skillTokens.has(token))  w += WEIGHT_SKILL;
    if (descTokens.has(token))   w += WEIGHT_DESC;
    weightedMatches += w;
  }

  const maxPossible = queryTokens.length * MAX_WEIGHT;
  return maxPossible === 0 ? 0 : Math.min(1, weightedMatches / maxPossible);
}

export function recencyScore(job) {
  if (!job.posted_at) return 0.1;

  const postedMs = new Date(job.posted_at).getTime();
  if (isNaN(postedMs)) return 0.1;

  const daysOld = Math.max(0, (Date.now() - postedMs) / (1000 * 60 * 60 * 24));
  return Math.exp(-0.1 * daysOld);
}

export function salaryScore(job, expectedSalary) {
  const jobMax = job.salary_max;
  const jobMin = job.salary_min;

  if (expectedSalary && expectedSalary > 0) {
    if (!jobMax) return 0.1;
    return jobMax >= expectedSalary ? 1 : jobMax / expectedSalary;
  }

  if (jobMin && jobMax) return 0.8;
  if (jobMin || jobMax) return 0.5;
  return 0.1;
}

export function locationScore(job, where, remote) {
  if (remote) {
    const isRemote = /remote/i.test(job.location ?? '') ||
                     /remote/i.test(job.contract  ?? '');
    return isRemote ? 1.0 : 0.3;
  }

  if (!where) return 0.5;

  const jobLoc   = (job.location ?? '').toLowerCase().trim();
  const userLoc  = where.toLowerCase().trim();

  if (!jobLoc) return 0.3;

  if (jobLoc === userLoc) return 1.0;

  const jobTokens  = new Set(tokenize(jobLoc));
  const userTokens = tokenize(userLoc);

  const matched = userTokens.filter((t) => jobTokens.has(t)).length;
  if (matched === userTokens.length) return 1.0;
  if (matched > 0)                   return 0.5;
  return 0.3;
}

const SENIORITY_MAP = [
  { regex: /\bjunior\b|\bgrad(?:uate)?\b|\bentry[\s-]?level\b/i, years: 1  },
  { regex: /\bassociate\b/i,                                       years: 2  },
  { regex: /\bmid[\s-]?level\b/i,                                 years: 3  },
  { regex: /\bsenior\b|\bsr\b/i,                                  years: 5  },
  { regex: /\blead\b/i,                                           years: 7  },
  { regex: /\bstaff\b/i,                                          years: 8  },
  { regex: /\bprincipal\b/i,                                      years: 10 },
  { regex: /\bdirector\b/i,                                       years: 12 },
  { regex: /\bvp\b|\bvice\s+president\b/i,                       years: 15 },
];

const EXPLICIT_EXP_RE = /\b(\d{1,2})\s*[+]?\s*(?:years?|yrs?)\b/i;

export function inferJobExperience(job) {
  const corpus = `${job.title ?? ''} ${(job.description ?? '').slice(0, 500)}`;

  const m = EXPLICIT_EXP_RE.exec(corpus);
  if (m) return parseInt(m[1], 10);

  for (const { regex, years } of SENIORITY_MAP) {
    if (regex.test(corpus)) return years;
  }

  return null;
}

export function experienceScore(job, userExperience) {
  if (userExperience === null || userExperience === undefined) return 0.5;

  const jobExperience = inferJobExperience(job);
  if (jobExperience === null) return 0.5;

  const diff = Math.abs(userExperience - jobExperience);

  if (diff === 0)  return 1.00;
  if (diff === 1)  return 0.85;
  if (diff === 2)  return 0.70;
  if (diff === 3)  return 0.50;
  if (diff === 4)  return 0.30;
  return 0.10;
}

export function computeScore(job, params = {}) {
  const { what, where, remote = false, salaryMin, experience } = params;

  const kw  = keywordScore   (job, what);
  const rec = recencyScore   (job);
  const sal = salaryScore    (job, salaryMin ?? null);
  const loc = locationScore  (job, where, remote);
  const exp = experienceScore(job, experience ?? null);

  const raw = kw * 0.4 + rec * 0.2 + sal * 0.2 + loc * 0.1 + exp * 0.1;

  return {
    ...job,
    score: Math.round(Math.min(100, raw * 100)),
    scoreBreakdown: {
      keywordMatch    : +(kw  * 100).toFixed(1),
      recency         : +(rec * 100).toFixed(1),
      salaryScore     : +(sal * 100).toFixed(1),
      locationMatch   : +(loc * 100).toFixed(1),
      experienceMatch : +(exp * 100).toFixed(1),
    },
  };
}

export function scoreJobs(jobs, params = {}) {
  if (!Array.isArray(jobs) || jobs.length === 0) return [];
  return jobs
    .map((job) => computeScore(job, params))
    .sort((a, b) => b.score - a.score);
}

export function scoreJob(job, params = {}) {
  return computeScore(job, params);
}

export default {
  scoreJobs,
  scoreJob,
  computeScore,
  keywordScore,
  recencyScore,
  salaryScore,
  locationScore,
  experienceScore,
  inferJobExperience,
};
