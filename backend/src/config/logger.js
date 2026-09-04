import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { LOGGER_CONSTANTS } from '../constants/logger.constants.js';

// Ensure logs directory exists
const logDir = path.resolve(process.cwd(), LOGGER_CONSTANTS.LOG_DIR);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Format for console (human-readable, colorized)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: LOGGER_CONSTANTS.DATE_FORMAT }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const cleanMeta = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}${cleanMeta}`
      : `[${timestamp}] ${level}: ${message}${cleanMeta}`;
  })
);

// Format for file persistence (uncolorized, machine-readable JSON for production monitoring)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: LOGGER_CONSTANTS.DATE_FORMAT }),
  winston.format.errors({ stack: true }),
  winston.format.uncolorize(),
  winston.format.json()
);

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? LOGGER_CONSTANTS.DEFAULT_LEVEL_PROD : LOGGER_CONSTANTS.DEFAULT_LEVEL_DEV);

const logger = winston.createLogger({
  level: logLevel,
  transports: [
    // 1. Console Transport
    new winston.transports.Console({
      format: consoleFormat,
      handleExceptions: true,
      handleRejections: true,
    }),

    // 2. Error File Transport (Rotated based on constants)
    new winston.transports.File({
      filename: path.join(logDir, LOGGER_CONSTANTS.ERROR_LOG_FILE),
      level: 'error',
      format: fileFormat,
      maxsize: LOGGER_CONSTANTS.MAX_FILE_SIZE_BYTES,
      maxFiles: LOGGER_CONSTANTS.MAX_ROTATED_FILES,
      tailable: true,
      handleExceptions: true,
      handleRejections: true,
    }),

    // 3. Combined File Transport (Rotated based on constants)
    new winston.transports.File({
      filename: path.join(logDir, LOGGER_CONSTANTS.COMBINED_LOG_FILE),
      format: fileFormat,
      maxsize: LOGGER_CONSTANTS.MAX_FILE_SIZE_BYTES,
      maxFiles: LOGGER_CONSTANTS.MAX_ROTATED_FILES,
      tailable: true,
    }),
  ],
  exitOnError: false,
});

export default logger;
