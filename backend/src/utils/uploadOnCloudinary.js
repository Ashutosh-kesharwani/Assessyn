import fs from 'fs/promises';
import cloudinary from '../config/cloudinary.js';
import { FILE_MESSAGES } from '../constants/messages.constants.js';
import ApiError from './ApiError.js';
import logger from '../config/logger.js';

const removeLocalFile = async (localFilePath) => {
  if (!localFilePath) return;

  try {
    await fs.unlink(localFilePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.error(`removeLocalFile :: Error :: ${error.message}`);
    }
  }
};

const uploadOnCloudinary = async (localFilePath, options = {}) => {
  if (!localFilePath) return null;

  try {
    return await cloudinary.uploader.upload(localFilePath, {
      resource_type: options.resource_type || 'auto',
      ...options,
    });
  } catch (error) {
    logger.error(`uploadOnCloudinary :: Error :: ${error.message || error}`);
    throw new ApiError(500, FILE_MESSAGES.FILE_UPLOAD_FAILED || 'File upload to cloud storage failed.');
  } finally {
    await removeLocalFile(localFilePath);
  }
};

export default uploadOnCloudinary;
export { removeLocalFile };
