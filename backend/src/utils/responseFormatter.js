const CURRENCY_SYMBOL = {
  GBP: '£',
  USD: '$',
  EUR: '€',
  INR: '₹',
  AUD: 'A$',
  CAD: 'CA$',
  NZD: 'NZ$',
  SGD: 'S$',
  ZAR: 'R',
  RUB: '₽',
};

export function formatAmount(amount, currency) {
  const sym = CURRENCY_SYMBOL[currency] ?? currency ?? '';

  if (currency === 'INR') {
    const lakhs = amount / 100_000;
    return `${sym}${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1)}L`;
  }

  const k = amount / 1_000;
  return `${sym}${k % 1 === 0 ? k : k.toFixed(1)}K`;
}

export function formatSalary(min, max, currency = 'GBP') {
  if (!min && !max) return null;

  const cur = (currency || 'GBP').toUpperCase();

  if (min && max) {
    return `${formatAmount(min, cur)}–${formatAmount(max, cur)}`;
  }
  if (min) {
    return `${formatAmount(min, cur)}+`;
  }
  return `Up to ${formatAmount(max, cur)}`;
}

const SUMMARY_MAX_CHARS = 180;

export function buildSummary(description) {
  if (!description) return null;

  const flat = description.replace(/[\n\r]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  if (flat.length <= SUMMARY_MAX_CHARS) return flat;

  const sentenceEnd = flat.slice(0, SUMMARY_MAX_CHARS).lastIndexOf('.');
  if (sentenceEnd > SUMMARY_MAX_CHARS * 0.5) {
    return flat.slice(0, sentenceEnd + 1);
  }

  const wordEnd = flat.slice(0, SUMMARY_MAX_CHARS).lastIndexOf(' ');
  return `${flat.slice(0, wordEnd > 0 ? wordEnd : SUMMARY_MAX_CHARS)}…`;
}

export function presentJob(job) {
  return {
    title    : job.title     ?? null,
    company  : job.company   ?? null,
    location : job.location  ?? null,
    salary   : formatSalary(job.salary_min, job.salary_max, job.salary_currency),
    summary  : buildSummary(job.description),
    apply_url: job.url       ?? null,

    id        : job.id        ?? null,
    skills    : job.skills    ?? [],
    posted_at : job.posted_at ?? null,
    score     : job.score     ?? null,
  };
}

export function formatSearchResponse({
  jobs,
  total,
  page,
  pagination,
  rawQuery,
  queryMeta,
  duplicatesRemoved,
  cacheInfo,
} = {}) {
  const response = {
    page   : page     ?? 1,
    total  : total    ?? 0,
    results: (jobs ?? []).map(presentJob),
  };

  if (pagination) {
    response.totalPages  = pagination.totalPages  ?? null;
    response.hasNextPage = pagination.hasNextPage  ?? false;
    response.hasPrevPage = pagination.hasPrevPage  ?? false;
  }

  if (rawQuery)           response.rawQuery          = rawQuery;
  if (queryMeta)          response.queryMeta         = queryMeta;
  if (duplicatesRemoved)  response.duplicatesRemoved = duplicatesRemoved;
  if (cacheInfo)          response._cache            = cacheInfo;

  return response;
}

export function formatJobDetail(job) {
  const presented = presentJob(job);

  return {
    ...presented,
    description: job.description ?? null,
    contract   : job.contract    ?? null,
    category   : job.category    ?? null,
  };
}

export function formatCategories(categories) {
  return {
    total  : categories?.length ?? 0,
    results: categories ?? [],
  };
}

export function formatValidationError(errors) {
  return {
    success: false,
    error  : {
      code   : 'VALIDATION_ERROR',
      message: 'One or more query parameters are invalid.',
      details: errors,
    },
  };
}

export function formatError(err, statusCode) {
  const isDev = process.env.NODE_ENV !== 'production';
  return {
    success: false,
    error  : {
      code   : err.code    ?? 'INTERNAL_ERROR',
      message: err.message ?? 'An unexpected error occurred.',
      ...(isDev && err.stack ? { stack: err.stack } : {}),
    },
    ...(statusCode ? { statusCode } : {}),
  };
}

export function attach(req, res, next) {
  res.sendSearch     = (opts)       => res.status(200).json(formatSearchResponse(opts));
  res.sendJobDetail  = (job)        => res.status(200).json(formatJobDetail(job));
  res.sendCategories = (cats)       => res.status(200).json(formatCategories(cats));
  res.sendError      = (err, status = 500) => res.status(status).json(formatError(err, status));
  next();
}

export const formatJobList = formatSearchResponse;

export default {
  formatSearchResponse,
  formatJobDetail,
  formatCategories,
  presentJob,
  formatSalary,
  buildSummary,
  formatValidationError,
  formatError,
  attach,
  formatJobList,
};
