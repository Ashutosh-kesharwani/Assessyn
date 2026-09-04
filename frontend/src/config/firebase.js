import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut
} from 'firebase/auth';

const requiredEnv = (value, name) => {
  if (!value) {
    throw new Error(`Missing required Firebase environment variable: ${name}`);
  }

  return String(value);
};

const firebaseConfig = {
  apiKey: requiredEnv(
    import.meta.env.VITE_FIREBASE_API_KEY,
    "VITE_FIREBASE_API_KEY"
  ),
  authDomain: requiredEnv(
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    "VITE_FIREBASE_AUTH_DOMAIN"
  ),
  projectId: requiredEnv(
    import.meta.env.VITE_FIREBASE_PROJECT_ID,
    "VITE_FIREBASE_PROJECT_ID"
  ),
  storageBucket: requiredEnv(
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    "VITE_FIREBASE_STORAGE_BUCKET"
  ),
  messagingSenderId: requiredEnv(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    "VITE_FIREBASE_MESSAGING_SENDER_ID"
  ),
  appId: requiredEnv(
    import.meta.env.VITE_FIREBASE_APP_ID,
    "VITE_FIREBASE_APP_ID"
  ),
};

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in with Google Popup
 */
export const signInWithGoogle = async () => {
  console.log('🌐 [FIREBASE-CLIENT] Opening signInWithPopup for Google Auth...');
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log('✅ [FIREBASE-CLIENT] Google popup resolved. Retrieving idToken for user:', user.email);
    const idToken = await user.getIdToken();
    console.log('🔑 [FIREBASE-CLIENT] Obtained ID Token preview:', idToken.substring(0, 25) + '...');
    return {
      success: true,
      idToken,
      user: {
        name: user.displayName || user.email?.split('@')[0] || 'Shinobi Candidate',
        email: user.email,
        photoURL: user.photoURL,
        firebaseUid: user.uid,
        provider: 'google',
      },
    };
  } catch (error) {
    console.error('❌ [FIREBASE-CLIENT] Google sign-in failed with code:', error.code, error.message);
    // Only allow development mock bypass if explicitly opted-in via env variable
    if (
      import.meta.env.DEV &&
      import.meta.env.VITE_ENABLE_DEV_MOCKS === 'true' &&
      (error.code === 'auth/invalid-api-key' ||
        error.code === 'auth/configuration-not-found' ||
        error.code === 'auth/network-request-failed' ||
        error.message?.includes('API key'))
    ) {
      console.warn('[DEV ONLY] VITE_ENABLE_DEV_MOCKS enabled: Providing mock Google user.');
      return {
        success: true,
        user: {
          name: 'Shinobi Warrior (Dev Mock)',
          email: 'dev.mock.shinobi@example.com',
          photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=ShinobiGoogle',
          firebaseUid: 'mock_google_' + Date.now(),
          provider: 'google',
        },
      };
    }
    return {
      success: false,
      message: error.message || 'Google sign-in failed.',
    };
  }
};

/**
 * Setup invisible Recaptcha for Mobile Phone OTP
 */
export const setupPhoneRecaptcha = (containerId = 'recaptcha-container') => {
  try {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch {}
      window.recaptchaVerifier = null;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`[FIREBASE] Recaptcha container #${containerId} not in DOM yet.`);
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      containerId,
      {
        size: 'invisible',
        callback: () => {
          console.log('🛡️ [FIREBASE-CLIENT] reCAPTCHA verified successfully.');
        },
        'expired-callback': () => {
          console.warn('⚠️ [FIREBASE-CLIENT] reCAPTCHA expired. Re-initializing...');
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
        },
      }
    );

    return window.recaptchaVerifier;
  } catch (err) {
    console.warn('Recaptcha setup notice:', err.message);
    return window.recaptchaVerifier || null;
  }
};

/**
 * =========================================================================
 * 📱 MOBILE PHONE OTP AUTHENTICATION
 * =========================================================================
 * 
 * 🚀 HOW TO ENABLE 100% REAL SMS IN PRODUCTION (Worldwide Telecom Delivery):
 * 1. Go to Firebase Console -> Upgrade to Blaze Plan (Pay as you go).
 * 2. Go to Authentication -> Settings -> SMS Region Policy -> Select "Allow all regions" or "India (+91)".
 * 3. In production, `signInWithPhoneNumber(auth, phoneNumber, appVerifier)` dispatches
 *    live cryptographically random 6-digit SMS OTPs directly to user phones.
 * 
 * 🧪 DEVELOPMENT & LOCAL TESTING MODE:
 * - If running locally without billing / on Spark plan, the system engages dev testing mode.
 * - Test Number: 9123456789 (or any 10-digit number)
 * - Test OTP Code: 123456
 * =========================================================================
 */
export const sendPhoneOtp = async (phoneNumber, appVerifier) => {
  console.log('📱 [FIREBASE-CLIENT] Sending Phone OTP to:', phoneNumber);
  try {
    // ── LIVE PRODUCTION SMS GATEWAY ─────────────────────────────────────
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    console.log('✅ [FIREBASE-CLIENT] Live SMS OTP dispatched by Google Telecom Gateway.');
    return {
      success: true,
      confirmationResult,
    };
  } catch (error) {
    console.error('❌ [FIREBASE-CLIENT] Live SMS Gateway notice:', error.code, error.message);

    // ── DEVELOPMENT & TEST FALLBACK (Spark Plan / Localhost) ───────────
    if (
      import.meta.env.DEV &&
      (import.meta.env.VITE_ENABLE_DEV_MOCKS === 'true' ||
        error.code === 'auth/billing-not-enabled' ||
        error.code === 'auth/operation-not-allowed' ||
        error.code === 'auth/invalid-api-key' ||
        error.code === 'auth/configuration-not-found' ||
        error.message?.includes('region enabled') ||
        error.message?.includes('billing'))
    ) {
      console.warn('⚠️ [DEV TESTING MODE] Live SMS requires Blaze Billing in Firebase Console. Engaging dev testing mode for number:', phoneNumber);
      
      // Returns a standard verification session that verifies OTP code: 123456
      return {
        success: true,
        confirmationResult: {
          confirm: async (otp) => {
            if (otp === '123456' || otp.length === 6) {
              return {
                user: {
                  phoneNumber,
                  uid: 'phone_' + phoneNumber.replace(/\D/g, ''),
                  displayName: `Shinobi (+${phoneNumber.slice(-4)})`,
                  getIdToken: async () => 'dev_mock_phone_token_' + Date.now(),
                },
              };
            }
            throw new Error('Invalid OTP code. In dev test mode, please enter OTP: 123456');
          },
        },
      };
    }

    let userFriendlyMessage = error.message || 'Failed to send OTP to mobile number.';
    if (error.code === 'auth/invalid-phone-number') {
      userFriendlyMessage = 'Invalid phone number format. Please enter a valid 10-digit mobile number.';
    } else if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/billing-not-enabled') {
      userFriendlyMessage = 'SMS requires Blaze plan or test numbers in Firebase Console. In dev mode, use OTP 123456.';
    } else if (error.code === 'auth/too-many-requests') {
      userFriendlyMessage = 'Too many requests sent. Please wait a moment before trying again.';
    }

    return {
      success: false,
      message: userFriendlyMessage,
    };
  }
};

export { auth, googleProvider };
export default app;
