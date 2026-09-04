import Plan from '../models/Plan.model.js';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

export const DEFAULT_SHINOBI_PLANS = [
  {
    code: 'trial_7days_50',
    name: '7-Day Combat Trial Pass',
    subtitle: 'Pocket-friendly low-friction test pass for instant interview preparation.',
    price: 50,
    durationDays: 7,
    category: 'quick_test',
    badgeText: 'QUICK TEST // TRIAL PASS',
    savingsText: '₹7 / Day',
    ctaText: 'Claim 7-Day Pass',
    accentColor: '#f59e0b',
    sortOrder: 1,
    isPublished: true,
    isArchived: false,
    features: [
      '⚡ 7 Full Days of Unlimited AI Mock Simulations',
      '🤖 5 Multi-LLM BYOK Cascade Access',
      '📄 10 Top ATS Resume Templates & PDF Export',
      '🌐 10 Developer Portfolio Builder Styles',
      '🎯 Role-Specific Question Bank Generator',
    ],
  },
  {
    code: 'pro_monthly_299',
    name: 'Pro Shinobi Monthly Mastery',
    subtitle: 'Our flagship membership for active job hunters facing technical rounds this month.',
    price: 299,
    durationDays: 30,
    category: 'most_popular',
    badgeText: 'MOST POPULAR // SHINOBI CHOICE',
    savingsText: 'Best Value',
    ctaText: 'Unlock Pro Monthly',
    accentColor: '#10b981',
    sortOrder: 2,
    isPublished: true,
    isArchived: false,
    features: [
      '🔥 Unlimited AI Voice & Text Interview Arenas',
      '⚡ Sub-Second Speech-to-Text Audio Pipeline',
      '🛡️ 5-Model Smart Failover (Gemini, Claude, Groq, OpenAI, DeepSeek)',
      '📄 10 ATS Resume Templates + JD Restructurer',
      '🌐 10 Developer Portfolio Templates with HTML Export',
      '🚀 JD Portfolio Project Builder with Starter Code',
      '🎯 Dynamic 4-Week Career Sprint Roadmap',
      '📡 24h Fresh Time-Filtered Live Job Radar',
    ],
  },
  {
    code: 'pro_6months_1299',
    name: '6-Month Jonin Veteran Pass',
    subtitle: 'Sustained career transformation pass for mid & senior engineers.',
    price: 1299,
    durationDays: 180,
    category: 'economical',
    badgeText: 'ECONOMICAL // SAVE 28%',
    savingsText: 'Save 28%',
    ctaText: 'Get 6-Month Pass',
    accentColor: '#0ea5e9',
    sortOrder: 3,
    isPublished: true,
    isArchived: false,
    features: [
      '🛡️ All Pro Features for 180 Continuous Days',
      '💎 Priority LLM Pipeline & Zero Token Throttling',
      '📈 Lifetime Session Analytics & Improvement Tracking',
      '📄 Unlimited ATS Resume Restructures & Downloads',
      '🌐 Custom Domain Ready Developer Portfolios',
      '⚡ Direct Priority Support from Ninja Architects',
    ],
  },
  {
    code: 'pro_annual_2199',
    name: '1-Year Shadow Kage VIP',
    subtitle: 'The ultimate all-inclusive career armament for long-term tech leadership.',
    price: 2199,
    durationDays: 365,
    category: 'long_term',
    badgeText: 'LONG TERM // VIP MAX SAVINGS',
    savingsText: 'Save 40%',
    ctaText: 'Join Shadow Kage VIP',
    accentColor: '#a855f7',
    sortOrder: 4,
    isPublished: true,
    isArchived: false,
    features: [
      '👑 Complete 365 Days of Unlimited VIP Access',
      '🚀 All Future Feature Drops & AI Models Included',
      '⚡ Highest Priority API Latency Bandwidth',
      '📄 10 ATS Resume Templates & 10 Portfolio Generators',
      '🎯 Unlimited JD Projects, Roadmaps & Question Banks',
      '🏆 Special Shadow Kage Golden Discord/Community Badge',
    ],
  },
];

// ─── GET /api/payment/plans (Public / Authenticated User Pricing) ────
export const getPublicPlans = asyncHandler(async (req, res) => {
  let plans = await Plan.find({ isPublished: true, isArchived: false }).sort('sortOrder price');

  if (!plans || plans.length === 0) {
    try {
      plans = await Plan.insertMany(DEFAULT_SHINOBI_PLANS);
    } catch {
      plans = DEFAULT_SHINOBI_PLANS;
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { plans }, 'Plans fetched successfully.'));
});

// ─── POST /api/admin/plans ─────────────────────────────────────────
export const createPlan = asyncHandler(async (req, res) => {
  const {
    name,
    code,
    subtitle,
    price,
    durationDays,
    category,
    badgeText,
    savingsText,
    ctaText,
    accentColor,
    sortOrder,
    credits,
    features,
    coupons,
    directDiscount,
    isPublished,
  } = req.body;

  if (!name || price === undefined) {
    throw new ApiError(400, 'Plan name and price are required.');
  }

  const plan = await Plan.create({
    name: name.trim(),
    code: code ? code.trim() : `plan_${Date.now()}`,
    subtitle: subtitle ? subtitle.trim() : '',
    price: parseFloat(price) || 0,
    durationDays: parseInt(durationDays, 10) || 30,
    category: category || 'general',
    badgeText: badgeText ? badgeText.trim() : '',
    savingsText: savingsText ? savingsText.trim() : '',
    ctaText: ctaText ? ctaText.trim() : 'Unlock Plan',
    accentColor: accentColor || '#10b981',
    sortOrder: parseInt(sortOrder, 10) || 0,
    credits: parseInt(credits, 10) || 9999,
    features: Array.isArray(features) ? features : [],
    coupons: Array.isArray(coupons) ? coupons : [],
    directDiscount: parseFloat(directDiscount) || 0,
    isPublished: isPublished !== undefined ? isPublished : true,
    postedBy: req.admin?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { plan }, 'Subscription plan created successfully.'));
});

// ─── GET /api/admin/plans ──────────────────────────────────────────
export const getAllPlans = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = { isArchived: false };
  if (req.query.archived === 'true') {
    filter.isArchived = true;
  } else if (req.query.archived === 'all') {
    delete filter.isArchived;
  }

  let [plans, total] = await Promise.all([
    Plan.find(filter)
      .sort('sortOrder price')
      .skip(skip)
      .limit(limit)
      .populate({ path: 'postedBy', select: 'name email' }),
    Plan.countDocuments(filter),
  ]);

  if (total === 0 && !req.query.archived) {
    plans = await Plan.insertMany(DEFAULT_SHINOBI_PLANS);
    total = plans.length;
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { plans, total, page, pages: Math.ceil(total / limit) },
      'Subscription plans retrieved successfully.'
    )
  );
});

// ─── GET /api/admin/plans/stats ────────────────────────────────────
export const getPlanStats = asyncHandler(async (req, res) => {
  const totalPlans = await Plan.countDocuments({ isArchived: false });
  const activePlans = await Plan.countDocuments({ isPublished: true, isArchived: false });
  const premiumUsers = await User.countDocuments({ isPremium: true, role: 'candidate' });

  const payload = {
    totalPlans,
    activePlans,
    premiumUsers,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, payload, 'Plan stats retrieved successfully.'));
});

// ─── GET /api/admin/plans/:id ──────────────────────────────────────
export const getPlanById = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id).populate({ path: 'postedBy', select: 'name email' });
  if (!plan) {
    throw new ApiError(404, 'Plan not found.');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { plan }, 'Plan retrieved successfully.'));
});

// ─── PATCH /api/admin/plans/:id ────────────────────────────────────
export const updatePlan = asyncHandler(async (req, res) => {
  const {
    name,
    code,
    subtitle,
    price,
    durationDays,
    category,
    badgeText,
    savingsText,
    ctaText,
    accentColor,
    sortOrder,
    credits,
    features,
    coupons,
    directDiscount,
    isPublished,
    isArchived,
  } = req.body;

  const plan = await Plan.findById(req.params.id);
  if (!plan) {
    throw new ApiError(404, 'Plan not found.');
  }

  const allowedFields = {};
  if (name !== undefined) allowedFields.name = name.trim();
  if (code !== undefined) allowedFields.code = code.trim();
  if (subtitle !== undefined) allowedFields.subtitle = subtitle.trim();
  if (price !== undefined) allowedFields.price = parseFloat(price) || 0;
  if (durationDays !== undefined) allowedFields.durationDays = parseInt(durationDays, 10) || 30;
  if (category !== undefined) allowedFields.category = category;
  if (badgeText !== undefined) allowedFields.badgeText = badgeText.trim();
  if (savingsText !== undefined) allowedFields.savingsText = savingsText.trim();
  if (ctaText !== undefined) allowedFields.ctaText = ctaText.trim();
  if (accentColor !== undefined) allowedFields.accentColor = accentColor;
  if (sortOrder !== undefined) allowedFields.sortOrder = parseInt(sortOrder, 10) || 0;
  if (credits !== undefined) allowedFields.credits = parseInt(credits, 10) || 9999;
  if (features !== undefined) allowedFields.features = Array.isArray(features) ? features : [];
  if (coupons !== undefined) allowedFields.coupons = Array.isArray(coupons) ? coupons : [];
  if (directDiscount !== undefined) allowedFields.directDiscount = parseFloat(directDiscount) || 0;
  if (isPublished !== undefined) allowedFields.isPublished = isPublished;
  if (isArchived !== undefined) allowedFields.isArchived = isArchived;

  const updated = await Plan.findByIdAndUpdate(req.params.id, allowedFields, {
    new: true,
    runValidators: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { plan: updated }, 'Plan updated successfully.'));
});

// ─── DELETE /api/admin/plans/:id ───────────────────────────────────
export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) {
    throw new ApiError(404, 'Plan not found.');
  }

  plan.isArchived = true;
  plan.isPublished = false;
  await plan.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Plan archived successfully.'));
});

export default {
  getPublicPlans,
  createPlan,
  getAllPlans,
  getPlanStats,
  getPlanById,
  updatePlan,
  deletePlan,
};
