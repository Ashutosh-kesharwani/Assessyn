import { fetchJSON } from '../utils/adzunaClient.js';
import jobsCache from '../utils/jobsCache.js';
import { mergeWithParsed } from '../utils/queryParser.js';
import { scoreJobs, scoreJob } from '../utils/scoringEngine.js';
import { slicePage } from '../utils/pagination.js';
import { normalizeJob, normalizeJobs } from '../utils/jobNormalizer.js';
import { deduplicateJobs } from '../utils/deduplicator.js';

const ADZUNA_BASE_URL   = 'https://api.adzuna.com/v1/api/jobs';
const ADZUNA_APP_ID     = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY    = process.env.ADZUNA_APP_KEY;
const DEFAULT_COUNTRY   = process.env.ADZUNA_COUNTRY  || 'gb';
const DEFAULT_RESULTS   = 20;
const PREFETCH_PAGES    = parseInt(process.env.ADZUNA_PREFETCH_PAGES, 10) || 3;

function buildSearchURL({
  what,
  where       = '',
  country     = DEFAULT_COUNTRY,
  page        = 1,
  results     = DEFAULT_RESULTS,
  category    = '',
  contract    = '',
  salaryMin   = '',
  salaryMax   = '',
  sortBy      = 'relevance',
  sortDir     = 'down',
}) {
  const qs = new URLSearchParams({
    app_id:           ADZUNA_APP_ID,
    app_key:          ADZUNA_APP_KEY,
    results_per_page: results,
  });

  if (sortBy === 'date' || sortBy === 'salary') {
    qs.set('sort_by', sortBy);
  }

  if (what && what !== 'null')      qs.set('what',          what);
  if (where && where !== 'null')     qs.set('where',         where);
  if (category && category !== 'null')  qs.set('category',      category);
  if (contract && contract !== 'null')  qs.set('contract_type', contract);
  if (salaryMin) qs.set('salary_min',    salaryMin);
  if (salaryMax) qs.set('salary_max',    salaryMax);

  return `${ADZUNA_BASE_URL}/${country}/search/${page}?${qs.toString()}`;
}

async function fetchAllPages(params) {
  const pageNumbers = Array.from({ length: PREFETCH_PAGES }, (_, i) => i + 1);

  const settled = await Promise.allSettled(
    pageNumbers.map((p) => fetchJSON(buildSearchURL({ ...params, page: p })))
  );

  const rawJobs = [];
  let   totalCount = 0;
  let   failedCount = 0;

  for (let i = 0; i < settled.length; i++) {
    const result = settled[i];
    if (result.status === 'fulfilled') {
      const data = result.value;
      rawJobs.push(...(data.results ?? []));
      if (i === 0) totalCount = data.count ?? 0;
    } else {
      failedCount++;
      console.warn(`[adzuna.service] Page ${i + 1} fetch failed:`, result.reason?.message);
    }
  }

  const fetchFailed = failedCount === settled.length && settled.length > 0;

  return { rawJobs, totalCount, fetchFailed };
}

function assertCredentials() {
  if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
    throw Object.assign(
      new Error('Adzuna credentials are not configured. Set ADZUNA_APP_ID and ADZUNA_APP_KEY.'),
      { status: 500, code: 'MISSING_CREDENTIALS' }
    );
  }
}

export async function searchJobs(rawParams) {
  assertCredentials();

  const { q, ...explicitParams } = rawParams;
  const params = await mergeWithParsed(explicitParams, q);

  const queryMeta = params._queryMeta;
  delete params._queryMeta;

  params.country = params.country || DEFAULT_COUNTRY;
  params.results = params.results || DEFAULT_RESULTS;
  const page     = Math.max(1, parseInt(params.page, 10) || 1);
  params.page    = page;

  const cachedSortedList = await jobsCache.getSortedList(params);

  if (cachedSortedList) {
    const { items: pageJobs, meta: pagination } = slicePage(cachedSortedList, {
      page,
      resultsPerPage: params.results,
    });
    return {
      count            : cachedSortedList.length,
      page,
      jobs             : pageJobs,
      duplicatesRemoved: 0,
      pagination,
      effectiveParams  : params,
      queryMeta,
      cacheHit         : true,
    };
  }

  const { rawJobs, fetchFailed } = await fetchAllPages(params);

  if (fetchFailed) {
    console.warn('[adzuna.service] Complete Adzuna API failure. Attempting stale fallback...');
    const fallbackList = await jobsCache.getStaleFallback(params);
    
    if (fallbackList && fallbackList.length > 0) {
      const { items: pageJobs, meta: pagination } = slicePage(fallbackList, {
        page,
        resultsPerPage: params.results,
      });
      return {
        count            : fallbackList.length,
        page,
        jobs             : pageJobs,
        duplicatesRemoved: 0,
        pagination,
        effectiveParams  : params,
        queryMeta,
        cacheHit         : true,
        isFallback       : true,
      };
    }
    
    throw new Error('Adzuna API is currently unavailable and no fallback data exists.');
  }

  const normalizedJobs = normalizeJobs(rawJobs, params.country);

  const { jobs: dedupedJobs, duplicatesRemoved } = await deduplicateJobs(normalizedJobs, params);

  const sortedList = scoreJobs(dedupedJobs, params);

  jobsCache.setSortedList(params, sortedList).catch(() => {});

  const { items: pageJobs, meta: pagination } = slicePage(sortedList, {
    page,
    resultsPerPage: params.results,
  });

  return {
    count            : sortedList.length,
    page,
    jobs             : pageJobs,
    duplicatesRemoved,
    pagination,
    effectiveParams  : params,
    queryMeta,
    cacheHit         : false,
  };
}

export async function getJobById(jobId, country = DEFAULT_COUNTRY) {
  assertCredentials();

  const cachedJob = await jobsCache.getDetail(jobId);
  if (cachedJob) return { ...cachedJob, cacheHit: true };

  const qs  = new URLSearchParams({ app_id: ADZUNA_APP_ID, app_key: ADZUNA_APP_KEY });
  const url = `${ADZUNA_BASE_URL}/${country}/jobs/${jobId}?${qs.toString()}`;
  const raw = await fetchJSON(url);

  const job = scoreJob(normalizeJob(raw, country), {});

  jobsCache.setDetail(jobId, job).catch(() => {});

  return job;
}

export async function getCategories(country = DEFAULT_COUNTRY) {
  assertCredentials();

  const cacheKey = `categories:${country}`;
  const cached   = await jobsCache.getDetail(cacheKey);
  if (cached) return cached;

  const qs   = new URLSearchParams({ app_id: ADZUNA_APP_ID, app_key: ADZUNA_APP_KEY });
  const url  = `${ADZUNA_BASE_URL}/${country}/categories?${qs.toString()}`;
  const data = await fetchJSON(url);

  const categories = data.results ?? [];
  jobsCache.setDetail(cacheKey, categories, 30 * 60).catch(() => {});
  return categories;
}

export default { searchJobs, getJobById, getCategories };
