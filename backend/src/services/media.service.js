import { FILE_MESSAGES } from '../constants/messages.constants.js';
import ApiError from '../utils/ApiError.js';
import deleteFromCloudinary from '../utils/deleteFromCloudinary.js';
import uploadOnCloudinary, { removeLocalFile } from '../utils/uploadOnCloudinary.js';

const uploadMedia = async (mediaLocalPath, options = {}) => {
  const media = await uploadOnCloudinary(mediaLocalPath, options);

  if (!media?.secure_url || !media?.public_id) {
    throw new ApiError(500, FILE_MESSAGES.FILE_UPLOAD_FAILED || FILE_MESSAGES.IMAGE_UPLOAD_FAILED);
  }

  return media;
};

const replaceMedia = async (oldPublicId, mediaLocalPath, options = {}) => {
  // 1. Upload the new image / media first
  const media = await uploadMedia(mediaLocalPath, options);

  // 2. Once new upload succeeds, delete the previous old file from Cloudinary
  try {
    if (oldPublicId) {
      await deleteFromCloudinary(oldPublicId, options);
    }
  } catch (error) {
    // If old deletion fails, clean up the newly uploaded asset to prevent orphans
    await deleteFromCloudinary(media.public_id, options).catch(() => null);
    throw error;
  }

  return media;
};

const removeMedia = async (publicId, options = {}) => {
  if (publicId) {
    await deleteFromCloudinary(publicId, options);
  }
};

export {
  uploadMedia,
  replaceMedia,
  removeMedia,
  removeLocalFile,
};

export default {
  uploadMedia,
  replaceMedia,
  removeMedia,
  removeLocalFile,
};
