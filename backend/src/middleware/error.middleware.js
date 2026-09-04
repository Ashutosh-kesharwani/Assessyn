import { GENERAL_MESSAGES } from '../constants/messages.constants.js';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';

const errorHandler = (err, req, res, next) => {
  if (!(err instanceof ApiError)) {
    // Handle Mongoose specific errors into ApiError instances
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'Field';
      err = new ApiError(409, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`);
    } else if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors || {}).map((e) => e.message);
      err = new ApiError(400, errors.join('. '), errors);
    } else if (err.name === 'CastError') {
      err = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
    } else if (err.name === 'JsonWebTokenError') {
      err = new ApiError(401, 'Invalid token. Please log in again.');
    } else if (err.name === 'TokenExpiredError') {
      err = new ApiError(401, 'Token expired. Please log in again.');
    } else {
      err = new ApiError(
        err.statusCode || 500,
        err.message || GENERAL_MESSAGES.INTERNAL_SERVER_ERROR,
        err.errors || [],
        err.stack
      );
    }
  }

  // Log Error via Winston logger
  logger.error(`[ApiError] ${err.statusCode} - ${err.message} - ${req.method} ${req.originalUrl}`);

  return res.status(err.statusCode).json({
    statusCode: err.statusCode,
    message: err.message,
    success: false,
    data: null,
    errors: err.errors || [],

    // Show stack only in Development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export default errorHandler;
