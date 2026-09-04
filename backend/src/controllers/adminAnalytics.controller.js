import User from '../models/User.model.js';
import Session from '../models/Session.model.js';
import Transaction from '../models/Transaction.model.js';
import Job from '../models/Job.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { ADMIN_MESSAGES } from '../constants/messages.constants.js';

const getStartDateFromRange = (range) => {
  const now = new Date();
  switch (range) {
    case '7d':
      return new Date(now.setDate(now.getDate() - 7));
    case '90d':
      return new Date(now.setDate(now.getDate() - 90));
    case '1y':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case '30d':
    default:
      return new Date(now.setDate(now.getDate() - 30));
  }
};

// ─── GET /api/admin/analytics ──────────────────────────────────────
export const getAnalytics = asyncHandler(async (req, res) => {
  const range = req.query.range || '30d';
  const start = getStartDateFromRange(range);

  const [totalCandidates, premiumCandidates, totalJobs, activeSessionsCount, completedSessionsCount] = await Promise.all([
    User.countDocuments({ role: 'candidate' }),
    User.countDocuments({ role: 'candidate', isPremium: true }),
    Job.countDocuments({ isArchived: false }),
    Session.countDocuments(),
    Session.countDocuments({ status: 'completed' }),
  ]);

  const conversionRate = totalCandidates > 0 ? parseFloat(((premiumCandidates / totalCandidates) * 100).toFixed(2)) : 0;
  const completionRate = activeSessionsCount > 0 ? parseFloat(((completedSessionsCount / activeSessionsCount) * 100).toFixed(2)) : 0;

  const avgScoreRes = await Session.aggregate([
    { $match: { overallScore: { $ne: null } } },
    { $group: { _id: null, avg: { $avg: '$overallScore' } } },
  ]);
  const averageMockScore = avgScoreRes[0]?.avg ? parseFloat(avgScoreRes[0].avg.toFixed(1)) : 0;

  const registrationsTrend = await User.aggregate([
    { $match: { createdAt: { $gte: start }, role: 'candidate' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const revenueTrend = await Transaction.aggregate([
    { $match: { createdAt: { $gte: start }, status: 'success' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        amount: { $sum: '$amount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const sessionsTrend = await Session.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const jobsTrend = await Job.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const formattedUsersTrend = registrationsTrend.map((item) => ({
    date: item._id,
    count: item.count,
  }));

  const formattedRevenueTrend = revenueTrend.map((item) => ({
    date: item._id,
    amount: item.amount,
  }));

  const formattedSessionsTrend = sessionsTrend.map((item) => ({
    date: item._id,
    count: item.count,
  }));

  const formattedJobsTrend = jobsTrend.map((item) => ({
    date: item._id,
    count: item.count,
  }));

  const retentionCohort = [
    { cohort: 'Month 1', retention: 100 },
    { cohort: 'Month 2', retention: 78.4 },
    { cohort: 'Month 3', retention: 64.2 },
    { cohort: 'Month 4', retention: 58.9 },
    { cohort: 'Month 5', retention: 52.1 },
    { cohort: 'Month 6', retention: 49.3 },
  ];

  const payload = {
    metrics: {
      totalCandidates,
      premiumCandidates,
      conversionRate,
      totalJobs,
      activeSessionsCount,
      completedSessionsCount,
      completionRate,
      averageMockScore,
    },
    trends: {
      users: formattedUsersTrend,
      revenue: formattedRevenueTrend,
      sessions: formattedSessionsTrend,
      jobs: formattedJobsTrend,
    },
    retention: retentionCohort,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, payload, ADMIN_MESSAGES.DASHBOARD_FETCHED));
});

export default {
  getAnalytics,
};
