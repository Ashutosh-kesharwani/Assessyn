import multer from 'multer';
import { FILE_MESSAGES } from '../../constants/messages.constants.js';
import ApiError from '../../utils/ApiError.js';
import storage from './storage.js';

const imageUpload = ({ maxSizeMB = 5 } = {}) =>
  multer({
    storage,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
    fileFilter(req, file, cb) {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new ApiError(400, FILE_MESSAGES.INVALID_IMAGE_TYPE));
      }

      cb(null, true);
    },
  });

export default imageUpload;
