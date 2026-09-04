import multer from 'multer';
import path from 'path';
import { FILE_MESSAGES } from '../../constants/messages.constants.js';
import ApiError from '../../utils/ApiError.js';
import storage from './storage.js';

const audioUpload = ({ maxSizeMB = 15 } = {}) =>
  multer({
    storage,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
    fileFilter(req, file, cb) {
      const allowedMimes = [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/x-wav',
        'audio/wave',
        'audio/ogg',
        'audio/x-m4a',
        'audio/m4a',
        'audio/mp4',
        'audio/aac',
        'audio/webm',
        'audio/flac',
      ];
      const allowedExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.webm', '.flac'];
      const ext = path.extname(file.originalname).toLowerCase();

      if (file.mimetype.startsWith('audio/') || allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        return cb(null, true);
      }

      cb(new ApiError(400, FILE_MESSAGES.INVALID_AUDIO_TYPE));
    },
  });

export default audioUpload;
