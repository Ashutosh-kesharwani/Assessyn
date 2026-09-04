import paymentService from '../services/payment.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { PAYMENT_MESSAGES } from '../constants/messages.constants.js';

// ─── POST /api/payment/payu/initiate ──────────────────────────────
export const initiatePayUPayment = asyncHandler(async (req, res) => {
  const payload = await paymentService.initiatePayment(req.user, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, payload, PAYMENT_MESSAGES.CHECKOUT_INITIATED));
});

// ─── POST /api/payment/payu/verify ────────────────────────────────
export const verifyPayUPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.verifyPayment(req.user._id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, result, PAYMENT_MESSAGES.PAYMENT_VERIFIED));
});

// ─── POST /api/payment/mock-checkout ──────────────────────────────
export const mockPayUCheckout = asyncHandler(async (req, res) => {
  const result = await paymentService.mockCheckout(req.user._id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, result, PAYMENT_MESSAGES.MOCK_CHECKOUT_SUCCESS));
});

// ─── GET /api/payment/history ─────────────────────────────────────
export const getBillingHistory = asyncHandler(async (req, res) => {
  const transactions = await paymentService.getBillingHistory(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, transactions, PAYMENT_MESSAGES.BILLING_HISTORY_FETCHED));
});

export default {
  initiatePayUPayment,
  verifyPayUPayment,
  mockPayUCheckout,
  getBillingHistory,
};
