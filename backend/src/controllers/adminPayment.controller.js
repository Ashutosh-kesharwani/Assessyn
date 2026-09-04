import paymentService from '../services/payment.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { PAYMENT_MESSAGES } from '../constants/messages.constants.js';

// ─── GET /api/admin/payments/transactions ──────────────────────────
export const getAllTransactions = asyncHandler(async (req, res) => {
  const payload = await paymentService.getAllTransactions(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, payload, PAYMENT_MESSAGES.BILLING_HISTORY_FETCHED));
});

// ─── GET /api/admin/payments/stats ────────────────────────────────
export const getPaymentStats = asyncHandler(async (req, res) => {
  const stats = await paymentService.getPaymentStats();
  return res
    .status(200)
    .json(new ApiResponse(200, { stats }, 'Payment stats retrieved successfully.'));
});

// ─── POST /api/admin/payments/transactions/:id/refund ──────────────
export const refundTransaction = asyncHandler(async (req, res) => {
  const tx = await paymentService.refundTransaction(req.params.id, req.body.reason);
  return res
    .status(200)
    .json(new ApiResponse(200, { transaction: tx }, 'Transaction refunded successfully.'));
});

// ─── GET /api/admin/payments/webhooks ──────────────────────────────
export const getWebhookLogs = asyncHandler(async (req, res) => {
  const payload = await paymentService.getWebhookLogs(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, payload, 'Webhook logs retrieved successfully.'));
});

export default {
  getAllTransactions,
  getPaymentStats,
  refundTransaction,
  getWebhookLogs,
};
