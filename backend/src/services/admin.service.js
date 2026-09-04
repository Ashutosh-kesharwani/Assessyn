import User from '../models/User.model.js';
import Interview from '../models/Interview.model.js';
import Session from '../models/Session.model.js';
import Resume from '../models/Resume.model.js';
import Job from '../models/Job.model.js';
import Transaction from '../models/Transaction.model.js';
import AuditLog from '../models/AuditLog.model.js';
import ApiError from '../utils/ApiError.js';
import {
  USER_MESSAGES,
  INTERVIEW_MESSAGES,
  SESSION_MESSAGES,
  RESUME_MESSAGES,
} from '../constants/messages.constants.js';

const ADMIN_EMAIL = 'admin@gmail.com';

export const getStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    premiumUsers,
    totalInterviews,
    totalSessions,
    totalResumes,
    activeUsers,
    completedSessions,
    interviewsToday,
    jobsCount,
  ] = await Promise.all([
    User.countDocuments({ role: 'candidate' }),
    User.countDocuments({ role: 'candidate', isPremium: true }),
    Interview.countDocuments(),
    Session.countDocuments(),
    Resume.countDocuments(),
    User.countDocuments({ isActive: true, role: 'candidate' }),
    Session.countDocuments({ status: 'completed' }),
    Interview.countDocuments({ createdAt: { $gte: today } }),
    Job.countDocuments({ isArchived: false }),
  ]);

  const freeUsers = Math.max(0, totalUsers - premiumUsers);
  const applicationsCount = totalResumes + totalSessions;

  const revAgg = await Transaction.aggregate([
    { $match: { status: 'success' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalRevenue = revAgg[0]?.total || 0;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo }, role: 'candidate' });

  const scoreAgg = await Session.aggregate([
    { $match: { status: 'completed', overallScore: { $ne: null } } },
    { $group: { _id: null, avgScore: { $avg: '$overallScore' } } },
  ]);

  const [recentRegs, recentSess, recentRes] = await Promise.all([
    User.find({ role: 'candidate' }).sort('-createdAt').limit(5),
    Session.find().sort('-createdAt').limit(5).populate({ path: 'userId', select: 'name email' }).populate({ path: 'interviewId', select: 'jobTitle' }),
    Resume.find().sort('-createdAt').limit(5).populate({ path: 'userId', select: 'name email' }),
  ]);

  let activities = [];
  recentRegs.forEach((u) => {
    activities.push({
      id: `user-${u._id}`,
      type: 'user',
      title: 'New Candidate Registered',
      message: `${u.name} (${u.email}) joined the platform`,
      timestamp: u.createdAt,
    });
  });
  recentSess.forEach((s) => {
    if (s.userId) {
      activities.push({
        id: `session-${s._id}`,
        type: 'session',
        title: 'Interview Completed',
        message: `${s.userId.name} completed mock interview for ${s.interviewId?.jobTitle || 'Developer'}`,
        timestamp: s.createdAt,
        score: s.overallScore,
      });
    }
  });
  recentRes.forEach((r) => {
    if (r.userId) {
      activities.push({
        id: `resume-${r._id}`,
        type: 'resume',
        title: 'Resume Uploaded',
        message: `${r.userId.name} uploaded a new resume file`,
        timestamp: r.createdAt,
      });
    }
  });

  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  activities = activities.slice(0, 8);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [usersTrend, revTrend, intTrend] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, role: 'candidate' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: 'success' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$amount' } } },
    ]),
    Session.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
  ]);

  const userGrowthMap = {};
  usersTrend.forEach((u) => { userGrowthMap[u._id] = u.count; });
  const revMap = {};
  revTrend.forEach((r) => { revMap[r._id] = r.total; });
  const sessMap = {};
  intTrend.forEach((i) => { sessMap[i._id] = i.count; });

  const charts = {
    userGrowth: [],
    revenue: [],
    sessionsTrend: [],
    dailyActivity: [],
  };

  const curr = new Date(sixMonthsAgo);
  const now = new Date();
  while (curr <= now) {
    const key = curr.toISOString().slice(0, 7);
    const label = monthNames[curr.getMonth()];
    charts.userGrowth.push({ month: label, users: userGrowthMap[key] || 0 });
    charts.revenue.push({ month: label, amount: revMap[key] || 0 });
    charts.sessionsTrend.push({ month: label, sessions: sessMap[key] || 0 });
    curr.setMonth(curr.getMonth() + 1);
  }

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const startOfWeek = new Date();
  const dayOfWeek = startOfWeek.getDay();
  const diffOffset = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  startOfWeek.setDate(diffOffset);
  startOfWeek.setHours(0, 0, 0, 0);

  const [weekSessions, weekUsers] = await Promise.all([
    Session.aggregate([
      { $match: { createdAt: { $gte: startOfWeek } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: startOfWeek }, role: 'candidate' } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
    ]),
  ]);

  const sessionDaysMap = {};
  weekSessions.forEach((s) => { sessionDaysMap[s._id] = s.count; });
  const userDaysMap = {};
  weekUsers.forEach((u) => { userDaysMap[u._id] = u.count; });

  const mongoDayMapping = [2, 3, 4, 5, 6, 7, 1];
  charts.dailyActivity = daysOfWeek.map((day, idx) => {
    const mongoDay = mongoDayMapping[idx];
    return {
      day,
      sessions: sessionDaysMap[mongoDay] || 0,
      users: userDaysMap[mongoDay] || 0,
    };
  });

  const failures = await AuditLog.find({ status: { $in: ['failed', 'warning'] } })
    .sort('-createdAt')
    .limit(5);

  const recentErrors = failures.map((f) => ({
    id: f._id,
    service: f.category.toUpperCase() + ' - ' + f.action,
    message: f.details,
    timestamp: f.createdAt,
    severity: f.status,
  }));

  return {
    totalUsers,
    premiumUsers,
    freeUsers,
    interviewsToday,
    totalInterviews,
    jobsCount,
    applicationsCount,
    totalRevenue,
    activeUsers,
    newUsersThisWeek: newUsers,
    platformAvgScore: scoreAgg[0]?.avgScore?.toFixed(1) ?? 0,
    activities,
    charts,
    recentErrors,
  };
};

export const getAllUsers = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const search = query.search || '';
  const role = query.role;
  const status = query.status;
  const sortBy = query.sortBy || 'createdAt';
  const sortDir = query.sortDir || query.sortOrder || 'desc';

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  if (role && role !== 'all') {
    filter.role = role;
  }

  if (status && status !== 'all') {
    if (status === 'active') {
      filter.isActive = true;
      filter.isBanned = false;
    } else if (status === 'inactive') {
      filter.isActive = false;
      filter.isBanned = false;
    } else if (status === 'banned') {
      filter.isBanned = true;
    } else if (status === 'premium') {
      filter.isPremium = true;
    }
  }

  const sortQuery = {};
  sortQuery[sortBy] = sortDir === 'asc' ? 1 : -1;

  const [users, total] = await Promise.all([
    User.find(filter).sort(sortQuery).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return { users, total, page, pages: Math.ceil(total / limit) };
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .populate('resumes')
    .populate({
      path: 'sessions',
      options: { sort: { createdAt: -1 } },
      populate: { path: 'interviewId', select: 'jobTitle company' },
    });

  if (!user) {
    throw new ApiError(404, USER_MESSAGES.USER_NOT_FOUND);
  }

  const [interviewCount, sessionCount, resumeCount] = await Promise.all([
    Interview.countDocuments({ userId: user._id }),
    Session.countDocuments({ userId: user._id }),
    Resume.countDocuments({ userId: user._id }),
  ]);

  return { user, interviewCount, sessionCount, resumeCount };
};

export const updateUser = async (userId, data) => {
  const { name, role, isActive, isBanned, isPremium, credits, creditsChange } = data;

  const target = await User.findById(userId);
  if (!target) {
    throw new ApiError(404, USER_MESSAGES.USER_NOT_FOUND);
  }

  if ((target.role === 'super_admin' || target.email === ADMIN_EMAIL) && role && role !== 'super_admin') {
    throw new ApiError(403, 'Cannot change the role of the super admin.');
  }

  const allowedFields = {};
  if (name !== undefined) allowedFields.name = name;
  if (role !== undefined) allowedFields.role = role;
  if (isActive !== undefined) allowedFields.isActive = isActive;
  if (isBanned !== undefined) allowedFields.isBanned = isBanned;
  if (isPremium !== undefined) allowedFields.isPremium = isPremium;
  if (credits !== undefined) allowedFields.credits = credits;

  if (creditsChange !== undefined) {
    allowedFields.$inc = { credits: creditsChange };
  }

  const user = await User.findByIdAndUpdate(userId, allowedFields, {
    new: true,
    runValidators: true,
  });

  return user;
};

export const bulkUserAction = async (userIds, action) => {
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new ApiError(400, 'No user IDs provided.');
  }

  if (!['activate', 'deactivate', 'ban', 'unban', 'delete'].includes(action)) {
    throw new ApiError(400, 'Invalid bulk action.');
  }

  const safeUserIds = [];
  const usersToInspect = await User.find({ _id: { $in: userIds } });

  usersToInspect.forEach((u) => {
    if (u.role !== 'super_admin' && u.email !== ADMIN_EMAIL) {
      safeUserIds.push(u._id);
    }
  });

  if (safeUserIds.length === 0) {
    throw new ApiError(403, 'No modifications allowed on the protected super admin account.');
  }

  if (action === 'activate') {
    await User.updateMany({ _id: { $in: safeUserIds } }, { isActive: true });
  } else if (action === 'deactivate') {
    await User.updateMany({ _id: { $in: safeUserIds } }, { isActive: false });
  } else if (action === 'ban') {
    await User.updateMany({ _id: { $in: safeUserIds } }, { isBanned: true });
  } else if (action === 'unban') {
    await User.updateMany({ _id: { $in: safeUserIds } }, { isBanned: false });
  } else if (action === 'delete') {
    await Promise.all([
      Interview.deleteMany({ userId: { $in: safeUserIds } }),
      Session.deleteMany({ userId: { $in: safeUserIds } }),
      Resume.deleteMany({ userId: { $in: safeUserIds } }),
      User.deleteMany({ _id: { $in: safeUserIds } }),
    ]);
  }

  return { affectedCount: safeUserIds.length };
};

export const deleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, USER_MESSAGES.USER_NOT_FOUND);
  }
  if (user.email === ADMIN_EMAIL) {
    throw new ApiError(403, 'Cannot delete the super admin account.');
  }

  await Promise.all([
    Interview.deleteMany({ userId: user._id }),
    Session.deleteMany({ userId: user._id }),
    Resume.deleteMany({ userId: user._id }),
    user.deleteOne(),
  ]);

  return true;
};

export const getAllInterviews = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [interviews, total] = await Promise.all([
    Interview.find()
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate({ path: 'userId', select: 'name email' }),
    Interview.countDocuments(),
  ]);

  return { interviews, total, page, pages: Math.ceil(total / limit) };
};

export const deleteInterview = async (interviewId) => {
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new ApiError(404, INTERVIEW_MESSAGES.INTERVIEW_NOT_FOUND);
  }

  await Promise.all([
    Session.deleteMany({ interviewId: interview._id }),
    interview.deleteOne(),
  ]);

  return true;
};

export const getAllSessions = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    Session.find()
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate({ path: 'userId', select: 'name email' })
      .populate({ path: 'interviewId', select: 'jobTitle company' }),
    Session.countDocuments(),
  ]);

  return { sessions, total, page, pages: Math.ceil(total / limit) };
};

export const deleteSession = async (sessionId) => {
  const session = await Session.findByIdAndDelete(sessionId);
  if (!session) {
    throw new ApiError(404, SESSION_MESSAGES.SESSION_NOT_FOUND);
  }
  return true;
};

export const getAllResumes = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [resumes, total] = await Promise.all([
    Resume.find()
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate({ path: 'userId', select: 'name email' }),
    Resume.countDocuments(),
  ]);

  return { resumes, total, page, pages: Math.ceil(total / limit) };
};

export const deleteResume = async (resumeId) => {
  const resume = await Resume.findByIdAndDelete(resumeId);
  if (!resume) {
    throw new ApiError(404, RESUME_MESSAGES.RESUME_NOT_FOUND);
  }
  return true;
};

export default {
  getStats,
  getAllUsers,
  getUserById,
  updateUser,
  bulkUserAction,
  deleteUser,
  getAllInterviews,
  deleteInterview,
  getAllSessions,
  deleteSession,
  getAllResumes,
  deleteResume,
};
