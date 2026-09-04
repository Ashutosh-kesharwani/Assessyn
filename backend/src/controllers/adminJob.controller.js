import Job from '../models/Job.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { JOB_MESSAGES } from '../constants/messages.constants.js';

const checkDuplicateJob = async (title, company, location) => {
  const existing = await Job.findOne({
    title: { $regex: `^${title.trim()}$`, $options: 'i' },
    company: { $regex: `^${company.trim()}$`, $options: 'i' },
    location: { $regex: `^${location.trim()}$`, $options: 'i' },
    isArchived: false,
  });
  return !!existing;
};

// ─── POST /api/admin/jobs ──────────────────────────────────────────
export const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    company,
    location,
    description,
    salaryMin,
    salaryMax,
    contractType,
    category,
    isFeatured,
    isPinned,
    applyUrl,
    ignoreDuplicate,
  } = req.body;

  if (!title || !company || !description) {
    throw new ApiError(400, 'Job title, company, and description are required.');
  }

  if (!ignoreDuplicate) {
    const isDup = await checkDuplicateJob(title, company, location || 'Remote');
    if (isDup) {
      throw new ApiError(409, 'A job listing with the same title, company, and location already exists.');
    }
  }

  const job = await Job.create({
    title: title.trim(),
    company: company.trim(),
    location: (location || 'Remote').trim(),
    description,
    salaryMin: salaryMin || null,
    salaryMax: salaryMax || null,
    contractType: contractType || 'full_time',
    category: category || 'General',
    isFeatured: !!isFeatured,
    isPinned: !!isPinned,
    applyUrl: (applyUrl || '').trim(),
    postedBy: req.admin?._id || req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { job }, 'Job listing published successfully.'));
});

// ─── GET /api/admin/jobs ───────────────────────────────────────────
export const getAllJobs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const category = req.query.category;
  const contractType = req.query.contractType;
  const status = req.query.status;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortDir = req.query.sortDir || req.query.sortOrder || 'desc';

  const filter = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }
  if (category && category !== 'all') {
    filter.category = category;
  }
  if (contractType && contractType !== 'all') {
    filter.contractType = contractType;
  }
  if (status && status !== 'all') {
    if (status === 'active') filter.isArchived = false;
    else if (status === 'archived') filter.isArchived = true;
    else if (status === 'featured') {
      filter.isFeatured = true;
      filter.isArchived = false;
    } else if (status === 'pinned') {
      filter.isPinned = true;
      filter.isArchived = false;
    }
  }

  const sortQuery = {};
  sortQuery.isPinned = -1;
  sortQuery[sortBy] = sortDir === 'asc' ? 1 : -1;

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate({ path: 'postedBy', select: 'name email' }),
    Job.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { jobs, total, page, pages: Math.ceil(total / limit) },
      JOB_MESSAGES.JOBS_FETCHED
    )
  );
});

// ─── GET /api/admin/jobs/stats ─────────────────────────────────────
export const getJobStats = asyncHandler(async (req, res) => {
  const [totalJobs, pinnedJobs, featuredJobs, archivedJobs, contractTypeAgg] = await Promise.all([
    Job.countDocuments(),
    Job.countDocuments({ isPinned: true }),
    Job.countDocuments({ isFeatured: true, isArchived: false }),
    Job.countDocuments({ isArchived: true }),
    Job.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: '$contractType', count: { $sum: 1 } } },
    ]),
  ]);

  const stats = {
    totalJobs,
    pinnedJobs,
    featuredJobs,
    archivedJobs,
    contractTypes: contractTypeAgg,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, 'Job stats retrieved successfully.'));
});

// ─── GET /api/admin/jobs/:id ───────────────────────────────────────
export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate({ path: 'postedBy', select: 'name email' });
  if (!job) {
    throw new ApiError(404, JOB_MESSAGES.JOB_NOT_FOUND);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { job }, JOB_MESSAGES.JOBS_FETCHED));
});

// ─── PATCH /api/admin/jobs/:id ─────────────────────────────────────
export const updateJob = asyncHandler(async (req, res) => {
  const {
    title,
    company,
    location,
    description,
    salaryMin,
    salaryMax,
    contractType,
    category,
    isFeatured,
    isPinned,
    isArchived,
    applyUrl,
  } = req.body;

  const job = await Job.findById(req.params.id);
  if (!job) {
    throw new ApiError(404, JOB_MESSAGES.JOB_NOT_FOUND);
  }

  const allowedFields = {};
  if (title !== undefined) allowedFields.title = title.trim();
  if (company !== undefined) allowedFields.company = company.trim();
  if (location !== undefined) allowedFields.location = location.trim();
  if (description !== undefined) allowedFields.description = description;
  if (salaryMin !== undefined) allowedFields.salaryMin = salaryMin;
  if (salaryMax !== undefined) allowedFields.salaryMax = salaryMax;
  if (contractType !== undefined) allowedFields.contractType = contractType;
  if (category !== undefined) allowedFields.category = category;
  if (isFeatured !== undefined) allowedFields.isFeatured = !!isFeatured;
  if (isPinned !== undefined) allowedFields.isPinned = !!isPinned;
  if (isArchived !== undefined) allowedFields.isArchived = !!isArchived;
  if (applyUrl !== undefined) allowedFields.applyUrl = applyUrl.trim();

  const updatedJob = await Job.findByIdAndUpdate(req.params.id, allowedFields, {
    new: true,
    runValidators: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { job: updatedJob }, 'Job listing updated successfully.'));
});

// ─── DELETE /api/admin/jobs/:id ────────────────────────────────────
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) {
    throw new ApiError(404, JOB_MESSAGES.JOB_NOT_FOUND);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Job listing deleted successfully.'));
});

// ─── POST /api/admin/jobs/bulk ─────────────────────────────────────
export const bulkJobAction = asyncHandler(async (req, res) => {
  const { jobIds, action } = req.body;

  if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
    throw new ApiError(400, 'No job IDs provided.');
  }

  const validActions = ['archive', 'unarchive', 'feature', 'unfeature', 'pin', 'unpin', 'delete'];
  if (!validActions.includes(action)) {
    throw new ApiError(400, 'Invalid bulk action.');
  }

  if (action === 'archive') {
    await Job.updateMany({ _id: { $in: jobIds } }, { isArchived: true });
  } else if (action === 'unarchive') {
    await Job.updateMany({ _id: { $in: jobIds } }, { isArchived: false });
  } else if (action === 'feature') {
    await Job.updateMany({ _id: { $in: jobIds } }, { isFeatured: true });
  } else if (action === 'unfeature') {
    await Job.updateMany({ _id: { $in: jobIds } }, { isFeatured: false });
  } else if (action === 'pin') {
    await Job.updateMany({ _id: { $in: jobIds } }, { isPinned: true });
  } else if (action === 'unpin') {
    await Job.updateMany({ _id: { $in: jobIds } }, { isPinned: false });
  } else if (action === 'delete') {
    await Job.deleteMany({ _id: { $in: jobIds } });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { affectedCount: jobIds.length },
      `Bulk ${action} operation completed successfully on ${jobIds.length} listings.`
    )
  );
});

export default {
  createJob,
  getAllJobs,
  getJobStats,
  getJobById,
  updateJob,
  deleteJob,
  bulkJobAction,
};
