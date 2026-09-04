import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import logger from './logger.js';

let isInitialized = false;
let googleCertsCache = null;
let googleCertsExpiry = 0;

/**
 * Fetch Google's public x509 certificates for Firebase ID token verification.
 * Cached in memory for 6 hours.
 */
const getGooglePublicCerts = async () => {
  const now = Date.now();
  if (googleCertsCache && now < googleCertsExpiry) {
    return googleCertsCache;
  }

  try {
    const response = await axios.get(
      'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
      { timeout: 5000 }
    );
    googleCertsCache = response.data;
    googleCertsExpiry = now + 6 * 60 * 60 * 1000;
    return googleCertsCache;
  } catch (err) {
    logger.error(`[Firebase Admin] Failed to fetch Google public certificates: ${err.message}`);
    if (googleCertsCache) return googleCertsCache;
    throw err;
  }
};

/**
 * Initialize Firebase Admin SDK safely using environment credentials.
 */
export const initFirebaseAdmin = () => {
  if (isInitialized || admin.apps.length > 0) {
    return admin.apps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.trim();
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  // Attempt 1: Full Service Account Credentials
  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
      isInitialized = true;
      logger.info(`[Firebase Admin] Initialized with service account for project: ${projectId}`);
      return admin.apps[0];
    } catch (err) {
      logger.warn(`[Firebase Admin] Service account initialization failed: ${err.message}`);
    }
  }

  // Attempt 2: Application Default Credentials or Project ID
  if (projectId) {
    try {
      admin.initializeApp({ projectId });
      isInitialized = true;
      logger.info(`[Firebase Admin] Initialized with Project ID: ${projectId}`);
      return admin.apps[0];
    } catch (err) {
      logger.warn(`[Firebase Admin] Project ID initialization failed: ${err.message}`);
    }
  }

  logger.warn('[Firebase Admin] Firebase environment credentials not configured.');
  return admin.apps.length > 0 ? admin.apps[0] : null;
};

// Initialize on module load
initFirebaseAdmin();

/**
 * Verify a Firebase ID token.
 * Primary: Firebase Admin SDK verifyIdToken.
 * Fallback: Direct Google RS256 x509 public certificate validation.
 * @param {string} idToken
 * @returns {Promise<admin.auth.DecodedIdToken>}
 */
export const verifyFirebaseIdToken = async (idToken) => {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Firebase ID token is required.');
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID environment variable is missing.');
  }

  // Strategy 1: Firebase Admin SDK verification
  try {
    if (admin.apps.length === 0) {
      initFirebaseAdmin();
    }

    if (admin.apps.length > 0) {
      return await admin.auth().verifyIdToken(idToken, false);
    }
  } catch (adminErr) {
    logger.warn(`[Firebase Auth] Admin SDK verifyIdToken failed, engaging public certificate verifier: ${adminErr.message}`);
  }

  // Strategy 2: Direct Google RS256 Public Certificate Verification
  try {
    const decodedHeader = jwt.decode(idToken, { complete: true });
    if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid) {
      throw new Error('Invalid Firebase ID token structure.');
    }

    const kid = decodedHeader.header.kid;
    const certs = await getGooglePublicCerts();
    const certificate = certs[kid];

    if (!certificate) {
      throw new Error(`Public certificate not found for key ID: ${kid}`);
    }

    const payload = jwt.verify(idToken, certificate, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
    });

    return {
      uid: payload.user_id || payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      phone_number: payload.phone_number,
      name: payload.name,
      picture: payload.picture,
      firebase: payload.firebase || {
        sign_in_provider: payload.firebase?.sign_in_provider || 'google.com',
      },
      ...payload,
    };
  } catch (fallbackErr) {
    logger.error(`[Firebase Auth] Cryptographic validation failed: ${fallbackErr.message}`);
    throw new Error(`Firebase token verification failed: ${fallbackErr.message}`);
  }
};

/**
 * Get the initialized Firebase Auth instance.
 * @returns {admin.auth.Auth | null}
 */
export const getFirebaseAuth = () => {
  if (admin.apps.length === 0) {
    initFirebaseAdmin();
  }
  return admin.apps.length > 0 ? admin.auth() : null;
};

export { admin };
export default admin;
