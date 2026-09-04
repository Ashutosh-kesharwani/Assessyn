import crypto from 'crypto';
import { getClient } from '../config/redis.js';
import { SEARCH_TTL_S } from './jobsCache.js';

// ─── Fingerprint Builders ─────────────────────────────────────────────────────

export function jobFingerprint(job) {
  const normalise = (s) => (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
  const raw = [
    normalise(job.title),
    normalise(job.company),
    normalise(job.location),
  ].join('|');

  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

export function dedupeKey(params) {
  const { page: _p, results: _r, ...searchParams } = params;
  const stable = Object.entries(searchParams)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const hash = crypto.createHash('sha256').update(stable).digest('hex').slice(0, 16);
  return `dedupe:${hash}`;
}

// ─── Redis-backed Deduplication ───────────────────────────────────────────────

export async function deduplicateJobs(jobs, params, ttl = SEARCH_TTL_S) {
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return { jobs: [], duplicatesRemoved: 0 };
  }

  const redis = getClient();

  if (redis) {
    try {
      return await redisDedup(jobs, params, ttl, redis);
    } catch (err) {
      console.warn('[Deduplicator] Redis dedup failed, falling back to in-process:', err.message);
    }
  }

  return inProcessDedup(jobs);
}

async function redisDedup(jobs, params, ttl, redis) {
  const key = dedupeKey(params);

  const fingerprints = jobs.map((job) => jobFingerprint(job));

  const pipeline = redis.pipeline();
  for (const fp of fingerprints) {
    pipeline.sadd(key, fp);
  }
  pipeline.expire(key, ttl);

  const results = await pipeline.exec();

  const unique = [];
  let duplicatesRemoved = 0;

  for (let i = 0; i < jobs.length; i++) {
    const [err, added] = results[i];
    if (err) {
      unique.push(jobs[i]);
    } else if (added === 1) {
      unique.push(jobs[i]);
    } else {
      duplicatesRemoved++;
      console.debug(`[Deduplicator] Duplicate removed: "${jobs[i].title}" @ ${jobs[i].company}`);
    }
  }

  return { jobs: unique, duplicatesRemoved };
}

function inProcessDedup(jobs) {
  const seen = new Set();
  const unique = [];
  let duplicatesRemoved = 0;

  for (const job of jobs) {
    const fp = jobFingerprint(job);
    if (seen.has(fp)) {
      duplicatesRemoved++;
    } else {
      seen.add(fp);
      unique.push(job);
    }
  }

  return { jobs: unique, duplicatesRemoved };
}

export async function clearDedupeSet(params) {
  const redis = getClient();
  if (!redis) return;
  try {
    await redis.del(dedupeKey(params));
  } catch (err) {
    console.warn('[Deduplicator] clearDedupeSet failed:', err.message);
  }
}

export default {
  deduplicateJobs,
  jobFingerprint,
  dedupeKey,
  clearDedupeSet,
};
