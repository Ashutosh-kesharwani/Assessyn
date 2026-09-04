export const LOGGER_CONSTANTS = {
  LOG_DIR: 'logs',
  ERROR_LOG_FILE: 'error.log',
  COMBINED_LOG_FILE: 'combined.log',
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  MAX_ROTATED_FILES: 5,
  DATE_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  DEFAULT_LEVEL_PROD: 'info',
  DEFAULT_LEVEL_DEV: 'debug',
};

export default LOGGER_CONSTANTS;
