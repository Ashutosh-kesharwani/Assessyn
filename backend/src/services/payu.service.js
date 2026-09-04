import crypto from 'crypto';
import User from '../models/User.model.js';
import Transaction from '../models/Transaction.model.js';
import Plan from '../models/Plan.model.js';
import logger from '../config/logger.js';

const PAYU_KEY = process.env.PAYU_MERCHANT_KEY || 'payu_test_key_ninja';
const PAYU_SALT = process.env.PAYU_MERCHANT_SALT || 'payu_test_salt_ninja';
const PAYU_BASE_URL = process.env.PAYU_BASE_URL || 'https://secure.payu.in/_payment';

/**
 * Generate SHA-512 Payment Hash for PayU Checkout Initiation
 * Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
export function generatePayUHash({
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  udf1 = '',
  udf2 = '',
  udf3 = '',
  udf4 = '',
  udf5 = '',
}) {
  const hashString = `${PAYU_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${PAYU_SALT}`;
  return crypto.createHash('sha512').update(hashString).digest('hex');
}

/**
 * Verify PayU Response Reverse Hash
 * Formula: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function verifyPayUResponseHash(params) {
  const {
    status,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = '',
    udf2 = '',
    udf3 = '',
    udf4 = '',
    udf5 = '',
    hash,
  } = params;

  // If in sandbox test mode without merchant keys, permit test bypass
  if (process.env.NODE_ENV !== 'production' && hash === 'test_bypass_hash') {
    return true;
  }

  const hashString = `${PAYU_SALT}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_KEY}`;
  const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

  return calculatedHash.toLowerCase() === (hash || '').toLowerCase();
}

/**
 * Activate Pro Plan for User upon successful payment
 */
export async function activateUserProPlan({ userId, txnid, amount = 299, paymentMethod = 'UPI / PayU' }) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const durationDays = 30;
  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  // Update user subscription
  user.isPremium = true;
  user.premiumExpiresAt = expiresAt;
  user.credits = (user.credits || 0) + 99999;
  await user.save();

  // Find or create Plan doc for reference
  let plan = await Plan.findOne({ name: /Pro Ninja/i });
  if (!plan) {
    plan = await Plan.create({
      name: 'Assessyn Pro Ninja (Monthly)',
      price: amount,
      durationDays: 30,
      credits: 99999,
      features: [
        'Unlimited Mock Interviews',
        '5-Model Multi-LLM BYOK & Auto-Routing',
        'AI Resume Restructurer & JD Matcher',
        'JD Portfolio Project Generator',
        'Targeted Interview Question Bank',
        'Time-Filtered Job Radar (Today, 2d, 4d, 7d)',
        'Dynamic 4-Week Career Prep Roadmap',
      ],
      postedBy: user._id,
    });
  }

  // Record Transaction
  const transaction = await Transaction.create({
    userId: user._id,
    planId: plan._id,
    transactionId: txnid || `PAYU_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    amount,
    currency: 'INR',
    status: 'success',
    paymentMethod,
    invoiceUrl: `/api/payment/invoice/${txnid}`,
  });

  logger.info(`[PayU] Pro Ninja Activated for user: ${user.email} (${user._id})`);

  return {
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
      credits: user.credits,
    },
    transaction,
  };
}
