import express from 'express';
import { verifyJWT } from '../middleware/index.js';
import {
  initiatePayUPayment,
  verifyPayUPayment,
  mockPayUCheckout,
  getBillingHistory,
} from '../controllers/payment.controller.js';
import { getPublicPlans } from '../controllers/adminPlan.controller.js';

const router = express.Router();

// Public plan catalog route (accessible for all users)
router.get('/plans', getPublicPlans);

// Protected payment routes
router.use(verifyJWT);

router.post('/payu/initiate', initiatePayUPayment);
router.post('/payu/verify', verifyPayUPayment);
router.post('/mock-checkout', mockPayUCheckout);
router.get('/history', getBillingHistory);

export default router;
