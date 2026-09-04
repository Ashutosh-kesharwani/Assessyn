import multer from 'multer';
import path from 'path';
import { FILE_MESSAGES } from '../../constants/messages.constants.js';
import ApiError from '../../utils/ApiError.js';
import storage from './storage.js';

const documentUpload = ({ maxSizeMB = 5 } = {}) =>
  multer({
    storage,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
    fileFilter(req, file, cb) {
      const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/octet-stream',
      ];
      const allowedExtensions = ['.pdf', '.doc', '.docx'];
      const ext = path.extname(file.originalname).toLowerCase();

      if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        return cb(null, true);
      }

      cb(new ApiError(400, FILE_MESSAGES.INVALID_FILE_TYPE));
    },
  });

export default documentUpload;
