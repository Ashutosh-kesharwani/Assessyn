import fs from 'fs/promises';
import pdf from 'pdf-parse';
import Resume from '../models/Resume.model.js';
import ApiError from '../utils/ApiError.js';
import { RESUME_MESSAGES, FILE_MESSAGES } from '../constants/messages.constants.js';
import { uploadMedia, removeMedia, removeLocalFile } from './media.service.js';
import { parseResumeAndJD } from './ai.service.js';
import { chunkResumeAndJD, estimateTokens } from './chunking.service.js';
import { normalizeText } from '../utils/normalizer.js';
import logger from '../config/logger.js';

export const uploadResume = async (userId, file) => {
  if (!file || !file.path) {
    throw new ApiError(400, FILE_MESSAGES.FILE_REQUIRED);
  }

  // 1. Strict 5-resume limit check BEFORE any upload to Cloudinary
  const existingCount = await Resume.countDocuments({ userId });
  if (existingCount >= 5) {
    await removeLocalFile(file.path);
    throw new ApiError(400, RESUME_MESSAGES.MAX_RESUMES_REACHED);
  }

  // 2. Parse text locally (PDF / DOCX)
  let extractedText = null;
  let parseStatus = 'pending';

  try {
    const isPdf =
      file.mimetype === 'application/pdf' ||
      file.originalname?.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      const fileBuffer = await fs.readFile(file.path);
      const pdfData = await pdf(fileBuffer);
      extractedText = pdfData.text?.slice(0, 8000) ?? null;
      parseStatus = extractedText ? 'parsed' : 'failed';
    } else {
      parseStatus = 'parsed';
    }
  } catch (parseErr) {
    logger.warn(`[Resume] PDF text extraction warning: ${parseErr.message}`);
    parseStatus = 'failed';
  }

  // 3. Upload file to Cloudinary via unified media service (auto-cleans local temp file)
  const sanitizedName = (file.originalname || 'resume').replace(/[^a-zA-Z0-9._-]/g, '_');
  const uploadResult = await uploadMedia(file.path, {
    folder: 'ai-interview/resumes',
    resource_type: 'raw',
  });

  const fileUrl = uploadResult?.secure_url || uploadResult?.url;
  const finalPublicId = uploadResult?.public_id;

  if (!fileUrl || !finalPublicId) {
    throw new ApiError(500, 'Resume upload to Cloudinary failed.');
  }

  // 4. Extract semantic profile & keywords with AI
  let parsedData = null;
  let isParsed = false;
  if (extractedText) {
    try {
      parsedData = await parseResumeAndJD(extractedText, '');
      isParsed = true;
    } catch (aiErr) {
      logger.warn(`[Resume] AI semantic parsing warning: ${aiErr.message}`);
    }
  }

  // 5. Store in Database
  const resume = await Resume.create({
    userId,
    fileName: sanitizedName,
    originalName: file.originalname,
    fileUrl,
    publicId: finalPublicId,
    fileSize: file.size,
    mimeType: file.mimetype,
    extractedText,
    parseStatus,
    parsedData,
    isParsed,
    isDefault: existingCount === 0,
  });

  logger.info(`[Resume] Resume uploaded successfully: ${resume._id} for user ${userId}`);
  return resume;
};

export const getMyResumes = async (userId) => {
  const resumes = await Resume.find({ userId }).sort('-createdAt');
  return { resumes, count: resumes.length };
};

export const deleteResume = async (userId, resumeId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) {
    throw new ApiError(404, RESUME_MESSAGES.RESUME_NOT_FOUND);
  }

  if (resume.publicId) {
    await removeMedia(resume.publicId, { resource_type: 'raw' }).catch((cloudErr) => {
      logger.warn(`[Resume] Cloudinary destroy error: ${cloudErr.message}`);
    });
  }

  await resume.deleteOne();
  return true;
};

export const setDefaultResume = async (userId, resumeId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) {
    throw new ApiError(404, RESUME_MESSAGES.RESUME_NOT_FOUND);
  }

  await Resume.updateMany({ userId }, { isDefault: false });
  resume.isDefault = true;
  await resume.save();
  return resume;
};

export const parseResume = async (userId, resumeId, jobDescription = '') => {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) {
    throw new ApiError(404, RESUME_MESSAGES.RESUME_NOT_FOUND);
  }

  if (!resume.extractedText) {
    throw new ApiError(400, 'No text extracted from this resume. Upload a valid PDF.');
  }

  try {
    const parsedData = await parseResumeAndJD(resume.extractedText, jobDescription);
    resume.parsedData = parsedData;
    resume.isParsed = true;
    resume.parseStatus = 'parsed';
    await resume.save();
    return { parsedData, resume };
  } catch (err) {
    resume.parseStatus = 'failed';
    await resume.save().catch(() => {});
    logger.error(`[Resume] Parsing failed: ${err.message}`);
    throw new ApiError(500, `AI parsing failed: ${err.message}`);
  }
};

export const chunkPreview = async (resumeText = '', jobDescription = '') => {
  if (!resumeText && !jobDescription) {
    throw new ApiError(400, 'Provide at least one of resumeText or jobDescription.');
  }

  const chunks = chunkResumeAndJD(resumeText, jobDescription);

  const enriched = chunks.map((chunk, i) => ({
    index: i,
    content: chunk.content,
    normalizedContent: normalizeText(chunk.content),
    metadata: chunk.metadata,
    estimatedTokens: estimateTokens(chunk.content),
    charCount: chunk.content.length,
  }));

  return { totalChunks: enriched.length, chunks: enriched };
};

export default {
  uploadResume,
  getMyResumes,
  deleteResume,
  setDefaultResume,
  parseResume,
  chunkPreview,
};
