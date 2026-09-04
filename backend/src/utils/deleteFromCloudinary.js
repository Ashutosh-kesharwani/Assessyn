import cloudinary from '../config/cloudinary.js';
import logger from '../config/logger.js';

const deleteFromCloudinary = async (publicId, options = {}) => {
  if (!publicId) return null;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: options.resource_type || 'image',
      ...options,
    });
    return result;
  } catch (error) {
    logger.error(`deleteFromCloudinary :: Error :: ${error.message || error}`);
    return null;
  }
};

export default deleteFromCloudinary;
