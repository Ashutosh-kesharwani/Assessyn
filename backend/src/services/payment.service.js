import {
  generatePayUHash,
  verifyPayUResponseHash,
  activateUserProPlan,
} from './payu.service.js';
import Transaction from '../models/Transaction.model.js';
import WebhookLog from '../models/WebhookLog.model.js';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import { PAYMENT_MESSAGES } from '../constants/messages.constants.js';
import logger from '../config/logger.js';

export const initiatePayment = async (user, data) => {
  const { amount = 299, productinfo = 'Assessyn Pro Ninja Membership' } = data;

  const txnid = 'PAYU_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
  const hash = generatePayUHash({
    txnid,
    amount,
    productinfo,
    firstname: user.name?.split(' ')[0] || 'Warrior',
    email: user.email,
  });

  return {
    key: process.env.PAYU_MERCHANT_KEY || 'payu_test_key_ninja',
    txnid,
    amount,
    productinfo,
    firstname: user.name?.split(' ')[0] || 'Warrior',
    email: user.email,
    phone: user.phone || user.mobile || '9999999999',
    hash,
    surl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/pricing?payment=success`,
    furl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/pricing?payment=failed`,
  };
};

export const verifyPayment = async (userId, data) => {
  const { txnid, amount = 299, paymentMethod = 'UPI' } = data;

  const isValid = verifyPayUResponseHash(data);
  if (!isValid && process.env.NODE_ENV === 'production') {
    throw new ApiError(400, PAYMENT_MESSAGES.INVALID_HASH);
  }

  try {
    const result = await activateUserProPlan({
      userId,
      txnid: txnid || `PAYU_${Date.now()}`,
      amount: Number(amount) || 299,
      paymentMethod,
    });

    logger.info(`[Payment] Verified payment ${txnid} for user: ${userId}`);
    return result;
  } catch (err) {
    logger.error(`[Payment] Verification failed: ${err.message}`);
    throw new ApiError(500, err.message || PAYMENT_MESSAGES.PAYMENT_FAILED);
  }
};

export const mockCheckout = async (userId, data) => {
  const { amount = 299, paymentMethod = 'UPI / PayU Sandbox' } = data;

  try {
    const result = await activateUserProPlan({
      userId,
      txnid: `MOCK_PAYU_${Date.now()}`,
      amount: Number(amount) || 299,
      paymentMethod,
    });

    logger.info(`[Payment] Mock checkout for user: ${userId}`);
    return result;
  } catch (err) {
    logger.error(`[Payment] Mock checkout error: ${err.message}`);
    throw new ApiError(500, err.message || 'Mock checkout failed.');
  }
};

export const getBillingHistory = async (userId) => {
  const transactions = await Transaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20);
  return transactions;
};

// ─── Admin Payment Methods ────────────────────────────────────────
export const getAllTransactions = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 12;
  const skip = (page - 1) * limit;
  const search = query.search || '';
  const status = query.status;

  const filter = {};

  if (status && status !== 'all') {
    filter.status = status;
  }

  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');

    const userIdsFilter = users.map((u) => u._id);

    filter.$or = [
      { transactionId: { $regex: search, $options: 'i' } },
      { userId: { $in: userIdsFilter } },
    ];
  }

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email isPremium')
      .populate('planId', 'name price'),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    total,
    pages: Math.ceil(total / limit) || 1,
    currentPage: page,
  };
};

export const getPaymentStats = async () => {
  const [
    totalRevRes,
    monthRevRes,
    totalTxCount,
    failedTxCount,
    refundedTxCount,
    successTxCount,
  ] = await Promise.all([
    Transaction.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: new Date(new Date().setDate(1)) },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.countDocuments(),
    Transaction.countDocuments({ status: 'failed' }),
    Transaction.countDocuments({ status: 'refunded' }),
    Transaction.countDocuments({ status: 'success' }),
  ]);

  const totalRevenue = totalRevRes[0]?.total || 0;
  const monthlyRecurringRevenue = monthRevRes[0]?.total || 0;
  const refundRate = totalTxCount > 0 ? parseFloat(((refundedTxCount / totalTxCount) * 100).toFixed(2)) : 0;

  return {
    totalRevenue,
    monthlyRecurringRevenue,
    totalTransactions: totalTxCount,
    successCount: successTxCount,
    failedCount: failedTxCount,
    refundCount: refundedTxCount,
    refundRate,
  };
};

export const refundTransaction = async (transactionId, reason) => {
  const tx = await Transaction.findById(transactionId).populate('userId');
  if (!tx) {
    throw new ApiError(404, 'Transaction record not found.');
  }

  if (tx.status === 'refunded') {
    throw new ApiError(400, 'This transaction has already been refunded.');
  }

  tx.status = 'refunded';
  tx.refundReason = reason || 'Admin issued refund through dashboard.';
  tx.refundedAt = new Date();
  await tx.save();

  if (tx.userId) {
    tx.userId.isPremium = false;
    await tx.userId.save();
  }

  return tx;
};

export const getWebhookLogs = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    WebhookLog.find().sort('-createdAt').skip(skip).limit(limit),
    WebhookLog.countDocuments(),
  ]);

  return {
    logs,
    total,
    pages: Math.ceil(total / limit) || 1,
    currentPage: page,
  };
};

export default {
  initiatePayment,
  verifyPayment,
  mockCheckout,
  getBillingHistory,
  getAllTransactions,
  getPaymentStats,
  refundTransaction,
  getWebhookLogs,
};
