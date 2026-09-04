import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

let apiRateLimiter;
let aiRateLimiter;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const redis = Redis.fromEnv();
    apiRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: '@assessyn/api',
    });

    aiRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      analytics: true,
      prefix: '@assessyn/ai',
    });
  } catch (err) {
    console.warn('[Upstash] Failed to initialize Ratelimit fromEnv:', err.message);
  }
}

// Fallback dummy limiter if Upstash is not configured
if (!apiRateLimiter) {
  apiRateLimiter = {
    limit: async () => ({ success: true, limit: 100, remaining: 100, reset: 0 }),
  };
}

if (!aiRateLimiter) {
  aiRateLimiter = {
    limit: async () => ({ success: true, limit: 20, remaining: 20, reset: 0 }),
  };
}

export { apiRateLimiter, aiRateLimiter };
export default {
  apiRateLimiter,
  aiRateLimiter,
};