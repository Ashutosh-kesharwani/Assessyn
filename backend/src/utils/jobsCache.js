import crypto from 'crypto';
import { getClient } from '../config/redis.js';

// ─── TTL Configuration ────────────────────────────────────────────────────────
export const SEARCH_TTL_S = parseInt(process.env.JOBS_CACHE_SEARCH_TTL_S, 10) || 900;  // 15 min
export const DETAIL_TTL_S = parseInt(process.env.JOBS_CACHE_DETAIL_TTL_S, 10) || 3600; // 1 hr
export const STALE_TTL_S  = 7 * 24 * 3600; // 7 days (Fallback cache)

// ─── Key Builders ─────────────────────────────────────────────────────────────

export function hashParams(params) {
  const stable = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  return crypto.createHash('sha256').update(stable).digest('hex').slice(0, 16);
}

export function searchKey(params, page) {
  const { page: _p, results: _r, ...searchParams } = params;
  return `jobs:${hashParams(searchParams)}:page:${page}`;
}

export function sortedListKey(params) {
  const { page: _p, results: _r, ...searchParams } = params;
  return `jobs:sorted:${hashParams(searchParams)}`;
}

export function staleListKey(params) {
  const { page: _p, results: _r, ...searchParams } = params;
  return `jobs:stale:${hashParams(searchParams)}`;
}

export const GLOBAL_FALLBACK_KEY = 'jobs:fallback:last_success';

export function detailKey(jobId) {
  return `job:${jobId}`;
}

// ─── Safe Redis Wrapper ───────────────────────────────────────────────────────

async function safeGet(key) {
  const redis = getClient();
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    if (raw) {
      console.log(`[Redis] Cache HIT (data served from Redis) for key: ${key}`);
      return JSON.parse(raw);
    }
    console.log(`[Redis] Cache MISS (data served from Database) for key: ${key}`);
    return null;
  } catch (err) {
    console.warn(`[jobsCache] GET failed for key "${key}":`, err.message);
    return null;
  }
}

async function safeSet(key, value, ttlSeconds) {
  const redis = getClient();
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    console.log(`[Redis] Cache Updated for key: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (err) {
    console.warn(`[jobsCache] SET failed for key "${key}":`, err.message);
  }
}

async function safeDel(key) {
  const redis = getClient();
  if (!redis) return;
  try {
    await redis.del(key);
    console.log(`[Redis] Cache Key Deleted: ${key}`);
  } catch (err) {
    console.warn(`[jobsCache] DEL failed for key "${key}":`, err.message);
  }
}

// ─── Level 0: Sorted List Cache (§2.8) ───────────────────────────────────────

export async function getSortedList(params) {
  const key = sortedListKey(params);
  const hit = await safeGet(key);
  if (hit) console.debug(`[jobsCache] HIT  ${key} (${hit.length} jobs)`);
  else     console.debug(`[jobsCache] MISS ${key}`);
  return hit;
}

export async function setSortedList(params, jobs, ttl = SEARCH_TTL_S) {
  const key = sortedListKey(params);
  
  await safeSet(key, jobs, ttl);

  if (jobs && jobs.length > 0) {
    await safeSet(staleListKey(params), jobs, STALE_TTL_S);
    await safeSet(GLOBAL_FALLBACK_KEY,  jobs, STALE_TTL_S);
  }

  console.debug(`[jobsCache] SET  ${key} (${jobs.length} jobs, TTL ${ttl}s)`);
}

export async function getStaleFallback(params) {
  const staleKey = staleListKey(params);
  let hit = await safeGet(staleKey);
  
  if (hit) {
    console.warn(`[jobsCache] Using STALE fallback for key ${staleKey}`);
    return hit;
  }
  
  hit = await safeGet(GLOBAL_FALLBACK_KEY);
  if (hit) {
    console.warn(`[jobsCache] Using GLOBAL fallback last_success`);
    return hit;
  }
  
  return null;
}

export async function delSortedList(params) {
  await safeDel(sortedListKey(params));
}

// ─── Level 1: Per-page Result Cache (§2.3 — kept for backward compat) ────────

export async function getSearch(params, page) {
  const key = searchKey(params, page);
  const hit = await safeGet(key);
  if (hit) console.debug(`[jobsCache] HIT  ${key}`);
  else     console.debug(`[jobsCache] MISS ${key}`);
  return hit;
}

export async function setSearch(params, page, result, ttl = SEARCH_TTL_S) {
  const key = searchKey(params, page);
  await safeSet(key, result, ttl);
  console.debug(`[jobsCache] SET  ${key} (TTL ${ttl}s)`);
}

export async function delSearch(params, page) {
  await safeDel(searchKey(params, page));
}

// ─── Level 2: Job Detail Cache ────────────────────────────────────────────────

export async function getDetail(jobId) {
  const key = detailKey(jobId);
  const hit = await safeGet(key);
  if (hit) console.debug(`[jobsCache] HIT  ${key}`);
  else     console.debug(`[jobsCache] MISS ${key}`);
  return hit;
}

export async function setDetail(jobId, job, ttl = DETAIL_TTL_S) {
  const key = detailKey(jobId);
  await safeSet(key, job, ttl);
  console.debug(`[jobsCache] SET  ${key} (TTL ${ttl}s)`);
}

export async function delDetail(jobId) {
  await safeDel(detailKey(jobId));
}

// ─── Cache Stats ──────────────────────────────────────────────────────────────

export async function stats() {
  const redis = getClient();
  if (!redis) {
    return { connected: false, reason: 'Redis disabled or not connected' };
  }
  try {
    const info    = await redis.info('memory');
    const dbSize  = await redis.dbsize();
    const memLine = info.match(/used_memory_human:(\S+)/);

    return {
      connected       : true,
      keyCount        : dbSize,
      usedMemory      : memLine ? memLine[1] : 'unknown',
      searchTtlS      : SEARCH_TTL_S,
      detailTtlS      : DETAIL_TTL_S,
    };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

export default {
  getSortedList,
  setSortedList,
  delSortedList,
  getStaleFallback,
  getSearch,
  setSearch,
  delSearch,
  getDetail,
  setDetail,
  delDetail,
  stats,
  sortedListKey,
  searchKey,
  detailKey,
  hashParams,
  SEARCH_TTL_S,
  DETAIL_TTL_S,
};
