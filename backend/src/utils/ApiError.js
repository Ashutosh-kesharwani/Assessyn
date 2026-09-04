import { GENERAL_MESSAGES } from '../constants/messages.constants.js';

class ApiError extends Error {
  constructor(
    statusCodeOrMessage,
    messageOrStatusCode = GENERAL_MESSAGES.INTERNAL_SERVER_ERROR,
    errors = [],
    stack = ''
  ) {
    let statusCode = 500;
    let message = GENERAL_MESSAGES.INTERNAL_SERVER_ERROR;

    if (typeof statusCodeOrMessage === 'number') {
      statusCode = statusCodeOrMessage;
      message = typeof messageOrStatusCode === 'string' ? messageOrStatusCode : GENERAL_MESSAGES.INTERNAL_SERVER_ERROR;
    } else if (typeof statusCodeOrMessage === 'string') {
      message = statusCodeOrMessage;
      statusCode = typeof messageOrStatusCode === 'number' ? messageOrStatusCode : 500;
    }

    super(message);

    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.data = null;
    this.errors = Array.isArray(errors) ? errors : (errors ? [errors] : []);
    this.isOperational = true;

    this.name = this.constructor.name;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
export default ApiError;
