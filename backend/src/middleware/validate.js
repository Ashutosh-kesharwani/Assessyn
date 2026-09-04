import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstErr = errors.array()[0];
    return next(new ApiError(400, firstErr.msg, errors.array()));
  }
  next();
};

export default validate;
