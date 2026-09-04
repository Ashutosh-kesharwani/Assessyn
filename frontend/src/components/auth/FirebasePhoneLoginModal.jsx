import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone, Lock, ArrowRight, CheckCircle2, Loader2, Sparkles, X,
  ShieldCheck, AlertCircle, RefreshCw, KeyRound
} from 'lucide-react';
import { setupPhoneRecaptcha, sendPhoneOtp } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function FirebasePhoneLoginModal({ isOpen, onClose, onSuccess }) {
  const { loginWithFirebase } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [timer, setTimer] = useState(60);

  const otpInputs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setPhoneNumber('');
      setOtpCode(['', '', '', '', '', '']);
      setConfirmationResult(null);
      setIsSending(false);
      setIsVerifying(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    let formattedNumber;
    if (phoneNumber.trim().startsWith('+')) {
      formattedNumber = `+${cleanDigits}`;
    } else {
      formattedNumber = `+91${cleanDigits.slice(-10)}`;
    }

    console.log('🚀 [FRONTEND-PHONE] Requesting OTP for formatted number:', formattedNumber);
    setIsSending(true);
    try {
      const appVerifier = setupPhoneRecaptcha('recaptcha-container');
      const res = await sendPhoneOtp(formattedNumber, appVerifier);
      if (res.success) {
        setConfirmationResult(res.confirmationResult);
        setStep('otp');
        setTimer(60);
        toast.success(`🔐 6-digit OTP sent to ${formattedNumber}`);
      } else {
        toast.error(res.message || 'Failed to send OTP.');
      }
    } catch (err) {
      toast.error(err.message || 'SMS Service error.');
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const fullCode = otpCode.join('');
    if (fullCode.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP code.');
      return;
    }

    setIsVerifying(true);
    try {
      if (!confirmationResult) {
        throw new Error('Verification session expired. Please resend OTP.');
      }

      const res = await confirmationResult.confirm(fullCode);
      const user = res.user;
      let idToken = null;
      if (typeof user.getIdToken === 'function') {
        idToken = await user.getIdToken();
      }

      const authRes = await loginWithFirebase({
        idToken: idToken || 'dev_phone_id_token_' + Date.now(),
        phoneNumber: user.phoneNumber || phoneNumber,
        firebaseUid: user.uid,
        provider: 'phone',
        name: `Shinobi (${(user.phoneNumber || phoneNumber).slice(-4)})`,
      });

      if (authRes.success) {
        toast.success('⚔️ Authenticated successfully via Mobile OTP!');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(authRes.message || 'Mobile authentication synchronization failed.');
      }
    } catch (err) {
      toast.error(err.message || 'Invalid or expired OTP code.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-surface border border-brand-500/40 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 p-6 sm:p-7 space-y-6"
        >
          {/* Katana Edge Sheen */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-400 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-secondary hover:text-white hover:bg-surface border border-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span>FIREBASE MOBILE AUTH</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9.5px] font-mono font-bold">
                Instant SMS
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-black text-white">
              {step === 'phone' ? 'Login with Mobile Number' : 'Enter 6-Digit OTP'}
            </h3>
            <p className="text-xs text-secondary font-mono">
              {step === 'phone'
                ? 'We will send a one-time cryptographic code via SMS. (Test Number: 9123456789)'
                : `Enter the 6-digit code sent to ${phoneNumber}. (Dev Test OTP: 123456)`}
            </p>
          </div>

          {/* Hidden Recaptcha container */}
          <div id="recaptcha-container" />

          {/* ── STEP 1: PHONE NUMBER INPUT ── */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-mono font-extrabold uppercase tracking-wider text-secondary">
                    Mobile Phone Number
                  </label>
                  <button
                    type="button"
                    onClick={() => setPhoneNumber('9123456789')}
                    className="text-[10px] font-mono font-bold text-brand-300 hover:text-brand-200 underline cursor-pointer"
                  >
                    Use Test: 9123456789
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-3 rounded-2xl bg-surface border border-subtle text-white font-mono text-xs sm:text-sm font-bold flex-shrink-0">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    placeholder="9123456789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-surface border border-subtle text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-brand-500/60 placeholder-secondary transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 text-white font-display font-black text-xs tracking-wide shadow-lg shadow-brand-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending SMS Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Login OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 2: OTP CODE INPUT ── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between gap-2">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputs.current[idx] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-14 rounded-2xl bg-surface border border-subtle text-center text-xl font-mono font-black text-brand-300 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30 transition-all"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-secondary pt-1">
                  <span>
                    Resend code in:{' '}
                    <strong className="text-white">{timer > 0 ? `${timer}s` : 'Ready'}</strong>
                  </span>
                  {timer === 0 && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-brand-400 hover:text-brand-300 font-bold underline cursor-pointer"
                    >
                      Resend SMS OTP
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="flex-1 py-3 rounded-2xl bg-surface border border-subtle text-secondary hover:text-white text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Change Number
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-[2] py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-violet-600 text-white font-display font-black text-xs tracking-wide shadow-lg shadow-brand-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Enter Arena</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer badge */}
          <div className="pt-2 text-center border-t border-subtle/50">
            <span className="text-[10px] font-mono text-secondary flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Firebase 2FA End-to-End Cryptographic Handshake</span>
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
