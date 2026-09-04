import { apiRateLimiter } from '../config/upstash.js';
import ApiError from '../utils/ApiError.js';
import { GENERAL_MESSAGES } from '../constants/messages.constants.js';
import logger from '../config/logger.js';

const rateLimiter = async (req, res, next) => {
  try {
    const identifier = req.user?.id
      ? `user:${req.user.id}`
      : `ip:${req.ip}`;

    const result = await apiRateLimiter.limit(identifier);

    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.reset);

    if (!result.success) {
      return next(new ApiError(429, GENERAL_MESSAGES.TOO_MANY_REQUESTS));
    }

    next();
  } catch (error) {
    logger.warn(`[RateLimit] Error: ${error.message}`);
    next();
  }
};

export default rateLimiter;