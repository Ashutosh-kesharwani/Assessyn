/**
 * scripts/verifyPhase2Auth.js
 * 
 * Phase 2 Comprehensive Test Runner
 * Tests:
 * 1. User Model Schema & Username Normalization
 * 2. Username Availability API logic
 * 3. PATCH /api/users/me forbidden field rejection
 * 4. PATCH /api/users/me safe fields & username update
 * 5. Firebase Admin Token Verification & Error Handling
 * 6. Account Linking and Firebase Sync Logic
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.model.js';
import * as firebaseAdminModule from '../config/firebaseAdmin.js';
import { updateMe, checkUsernameAvailability, getMe } from '../controllers/user.controller.js';
import { syncFirebaseAuth, resolveUsername } from '../controllers/auth.controller.js';
import { firebaseAuthMiddleware } from '../middleware/index.js';

let passed = 0;
let failed = 0;

const assert = (condition, testName, details = '') => {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    failed++;
  }
};

async function runTests() {
  console.log('\n============================================================');
  console.log('🥋 [ASSESSYN PHASE 2 AUTHENTICATION SUITE]');
  console.log('============================================================\n');

  // Connect to DB if not connected
  if (mongoose.connection.readyState === 0) {
    const uri = process.env.MONGODB_URI
      ? `${process.env.MONGODB_URI}/${process.env.DB_NAME || 'AssessynDB'}?retryWrites=true&w=majority&appName=Assessyn-Cluster`
      : process.env.MONGO_URI;
    await mongoose.connect(uri);
  }

  const testSuffix = Date.now().toString(36);
  const testFirebaseUid = `firebase_uid_test_${testSuffix}`;
  const testGoogleEmail = `test.shinobi.${testSuffix}@example.com`;
  const testPhone = `+9199887${Math.floor(10000 + Math.random() * 90000)}`;

  // ── TEST GROUP 1: Username Normalization & Validation ──
  console.log('1️⃣ Testing Username Normalization & Validation:');
  const normalized1 = User.normalizeUsername('  Shinobi_Master_007  ');
  assert(normalized1 === 'shinobi_master_007', 'Username trimmed and lowercased');

  const normalized2 = User.normalizeUsername('ASHUTOSH');
  assert(normalized2 === 'ashutosh', 'Uppercase normalized to lowercase');

  const normalized3 = User.normalizeUsername('');
  assert(normalized3 === '', 'Empty username returns empty string');

  // ── TEST GROUP 2: Username Availability Helper ──
  console.log('\n2️⃣ Testing Username Availability API Logic:');
  let mockReq = { params: { username: `available_${testSuffix}` } };
  let mockRes = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; },
  };

  await checkUsernameAvailability(mockReq, mockRes);
  assert(mockRes.data?.available === true, 'Unused username is available');

  // Test invalid username format
  mockReq = { params: { username: 'invalid#user!@' } };
  await checkUsernameAvailability(mockReq, mockRes);
  assert(mockRes.data?.available === false, 'Invalid format username rejected as unavailable');

  // ── TEST GROUP 3: Forbidden Field Protection on PATCH /api/users/me ──
  console.log('\n3️⃣ Testing Security & Forbidden Field Protection on PATCH /api/users/me:');
  const testUser = await User.create({
    name: 'Test Shinobi Candidate',
    email: testGoogleEmail,
    firebaseUid: testFirebaseUid,
    username: `testuser_${testSuffix}`,
    authProvider: 'google',
    emailVerified: true,
    role: 'candidate',
    isPremium: false,
    credits: 10,
  });

  // Attempt to modify forbidden fields: role, email, phone, isAdmin, isPremium
  let forbiddenCaught = false;
  let nextErr = null;
  const mockPatchReq = {
    user: testUser,
    body: {
      role: 'super_admin',
      isAdmin: true,
      email: 'hacked@evil.com',
      isPremium: true,
    },
  };
  const mockNext = (err) => {
    if (err) {
      forbiddenCaught = true;
      nextErr = err;
    }
  };

  await updateMe(mockPatchReq, mockRes, mockNext);
  assert(forbiddenCaught === true, 'Attempt to modify role/email/isPremium is rejected by updateMe', nextErr?.message);

  // ── TEST GROUP 4: Safe Profile Updates ──
  console.log('\n4️⃣ Testing Safe Profile & Username Update on PATCH /api/users/me:');
  const safePatchReq = {
    user: testUser,
    body: {
      name: 'Shinobi Master Updated',
      username: `shinobi_upd_${testSuffix}`,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Updated',
    },
  };

  let safeSuccess = false;
  const mockSafeRes = {
    status(code) { this.statusCode = code; return this; },
    json(data) {
      if (data.success) safeSuccess = true;
      this.data = data;
      return this;
    },
  };

  await updateMe(safePatchReq, mockSafeRes, (err) => console.error(err));
  assert(safeSuccess === true, 'Safe fields updated successfully');
  assert(mockSafeRes.data?.user?.username === `shinobi_upd_${testSuffix}`, 'Username updated in profile response');
  assert(mockSafeRes.data?.user?.name === 'Shinobi Master Updated', 'Name updated in profile response');

  // ── TEST GROUP 5: Duplicate Username Collision Prevention ──
  console.log('\n5️⃣ Testing Duplicate Username Collision Prevention:');
  const secondUser = await User.create({
    name: 'Second Candidate',
    email: `second_${testSuffix}@example.com`,
    firebaseUid: `second_fb_${testSuffix}`,
    username: `taken_user_${testSuffix}`,
  });

  let duplicateRejected = false;
  const dupPatchReq = {
    user: testUser,
    body: {
      username: `taken_user_${testSuffix}`, // same as secondUser
    },
  };
  await updateMe(dupPatchReq, mockRes, (err) => {
    if (err?.statusCode === 409 || err?.message?.includes('already taken')) {
      duplicateRejected = true;
    }
  });
  assert(duplicateRejected === true, 'Duplicate username update rejected with 409 Conflict');

  // ── TEST GROUP 6: GET /api/users/me Sanitization ──
  console.log('\n6️⃣ Testing GET /api/users/me Profile Sanitization:');
  let getMeProfile = null;
  const mockGetMeRes = {
    status(code) { return this; },
    json(data) { getMeProfile = data.user; return this; },
  };
  await getMe({ user: testUser }, mockGetMeRes);
  assert(getMeProfile !== null, 'Profile returned');
  assert(getMeProfile?.password === undefined, 'Password is not exposed in public profile');
  assert(getMeProfile?.refreshToken === undefined, 'Refresh token is not exposed in public profile');
  assert(getMeProfile?.firebaseUid === testFirebaseUid, 'Firebase UID attached correctly');

  // ── TEST GROUP 7: Firebase Authentication Middleware & Sync ──
  console.log('\n7️⃣ Testing Firebase Token Verification Middleware:');
  // Test missing token
  let missingTokenError = null;
  await firebaseAuthMiddleware({ headers: {} }, mockRes, (err) => {
    missingTokenError = err;
  });
  assert(missingTokenError?.statusCode === 401, 'Missing Bearer token rejected with 401');

  // Test invalid token
  let invalidTokenError = null;
  await firebaseAuthMiddleware({ headers: { authorization: 'Bearer invalid_garbage_token' } }, mockRes, (err) => {
    invalidTokenError = err;
  });
  assert(invalidTokenError?.statusCode === 401, 'Invalid Firebase token rejected with 401');

  // ── TEST GROUP 8: Resolve Username Helper ──
  console.log('\n8️⃣ Testing Username Resolver:');
  let resolvedEmail = null;
  await resolveUsername(
    { body: { username: `shinobi_upd_${testSuffix}` } },
    {
      status(code) { return this; },
      json(data) { resolvedEmail = data.email; return this; },
    },
    (err) => console.error(err)
  );
  assert(resolvedEmail === testGoogleEmail, 'Username resolved to correct email for Firebase client sign-in');

  // Clean up test data
  console.log('\n🧹 Cleaning up test database records...');
  await User.deleteMany({
    _id: { $in: [testUser._id, secondUser._id] },
  });

  console.log('\n============================================================');
  console.log(`🏁 Phase 2 Verification Completed: ${passed} Passed, ${failed} Failed`);
  console.log('============================================================\n');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
