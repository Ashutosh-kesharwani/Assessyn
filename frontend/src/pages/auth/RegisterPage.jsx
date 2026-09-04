import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, AlertCircle, Smartphone } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { signInWithGoogle } from '@/config/firebase';
import FirebasePhoneLoginModal from '@/components/auth/FirebasePhoneLoginModal';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { KatanaIcon, ShurikenIcon } from '@/components/ui/ShinobiIcons';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { register: registerUser, loginWithFirebase, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    const result = await registerUser({ name: data.name, email: data.email, password: data.password });
    if (result.success) {
      toast.success('Dossier created! Please sign in with your credentials 🗡️');
      navigate('/login');
    } else {
      toast.error(result.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    console.log('🚀 [FRONTEND-AUTH] Initiating Google Sign-In popup from RegisterPage...');
    try {
      const res = await signInWithGoogle();
      console.log('📦 [FRONTEND-AUTH] Google Sign-In response received:', {
        success: res.success,
        hasIdToken: Boolean(res.idToken),
        user: res.user,
      });

      if (res.success) {
        const authRes = await loginWithFirebase({
          idToken: res.idToken,
          ...res.user,
        });
        console.log('🔄 [FRONTEND-AUTH] loginWithFirebase response:', authRes);

        if (authRes.success) {
          toast.success(`⚔️ Authenticated via Google as ${res.user.name}!`);
          navigate('/dashboard');
        } else {
          toast.error(authRes.message || 'Google registration synchronization failed');
        }
      } else {
        toast.error(res.message || 'Google authentication canceled');
      }
    } catch (err) {
      console.error('❌ [FRONTEND-AUTH] Google Sign-In error:', err);
      toast.error(err.message || 'Google login error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-5 sm:p-7 rounded-xl bg-surface/95 backdrop-blur-3xl border border-subtle shadow-2xl space-y-3.5 relative overflow-hidden"
    >
      {/* Top Katana Edge Sheen Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/70 to-transparent pointer-events-none" />

      {/* Mode Switcher Pill */}
      <nav aria-label="Auth Mode Switcher" className="flex items-center p-1 rounded-lg bg-surface border border-subtle text-xs font-mono font-bold">
        <Link
          to="/login"
          className="flex-1 py-1.5 text-center text-secondary hover:text-white transition-colors text-[11px]"
        >
          Sign In
        </Link>
        <span className="flex-1 py-1.5 text-center rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30 shadow-xs text-[11px]">
          Create Dossier
        </span>
      </nav>

      {/* Header */}
      <header className="space-y-1 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-brand-500/15 border border-brand-500/30 text-brand-300 text-[9.5px] font-mono font-black uppercase tracking-wider">
          <ShurikenIcon className="w-3 h-3" />
          <span>NEW CANDIDATE REGISTRATION</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight leading-tight">
          Create <span className="text-[var(--accent-primary)]">Candidate Dossier</span>
        </h2>
        <p className="text-secondary text-[11.5px] font-mono">
          Forge your profile to access AI voice interviews and skill calibration
        </p>
      </header>

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
        {/* Full Name */}
        <div className="space-y-0.5">
          <label className="block text-[11px] font-mono font-extrabold uppercase tracking-wider text-secondary">
            Full Display Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
            <input
              type="text"
              placeholder="e.g. Ashutosh Kesharwani"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-subtle text-white placeholder-secondary text-xs sm:text-sm font-sans focus:outline-none focus:border-brand-500/60 transition-all shadow-inner"
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
            />
          </div>
          {errors.name && (
            <p className="text-[10px] font-mono text-rose-400 font-bold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.name.message}</span>
            </p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-0.5">
          <label className="block text-[11px] font-mono font-extrabold uppercase tracking-wider text-secondary">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
            <input
              type="email"
              placeholder="candidate@assessyn.com"
              autoComplete='username'
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-subtle text-white placeholder-secondary text-xs sm:text-sm font-mono focus:outline-none focus:border-brand-500/60 transition-all shadow-inner"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' }
              })}
            />
          </div>
          {errors.email && (
            <p className="text-[10px] font-mono text-rose-400 font-bold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.email.message}</span>
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-0.5">
          <label className="block text-[11px] font-mono font-extrabold uppercase tracking-wider text-secondary">
            Security Passphrase
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 chars, uppercase & number"
              autoComplete='new-password'
              className="w-full pl-10 pr-10 py-2 rounded-lg bg-surface border border-subtle text-white placeholder-secondary text-xs sm:text-sm font-mono focus:outline-none focus:border-brand-500/60 transition-all shadow-inner"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Must include uppercase, lowercase, and number',
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary hover:text-white transition-colors cursor-pointer"
              title={showPassword ? 'Hide passphrase' : 'Show passphrase'}
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[10px] font-mono text-rose-400 font-bold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.password.message}</span>
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-0.5">
          <label className="block text-[11px] font-mono font-extrabold uppercase tracking-wider text-secondary">
            Confirm Passphrase
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
            <input
              type="password"
              placeholder="Repeat your passphrase"
              autoComplete='new-password'
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface border border-subtle text-white placeholder-secondary text-xs sm:text-sm font-mono focus:outline-none focus:border-brand-500/60 transition-all shadow-inner"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (v) => v === password || 'Passphrases do not match',
              })}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-[10px] font-mono text-rose-400 font-bold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.confirmPassword.message}</span>
            </p>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-1.5 space-y-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={KatanaIcon}
            className="w-full py-3 rounded-lg font-black text-xs shadow-brand tracking-wider uppercase"
            disabled={isLoading}
            isLoading={isLoading}
          >
            <span>Forge Candidate Dossier</span>
          </Button>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-subtle"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono text-secondary uppercase font-bold">
              or register with
            </span>
            <div className="flex-grow border-t border-subtle"></div>
          </div>

          {/* OAuth & Phone Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="py-2.5 px-3 rounded-lg bg-surface border border-subtle hover:border-brand-400 text-[11px] font-mono font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:bg-surface/80"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Connecting...' : 'Google'}</span>
            </button>

            <button
              type="button"
              onClick={() => setPhoneModalOpen(true)}
              className="py-2.5 px-3 rounded-lg bg-surface border border-subtle hover:border-brand-400 text-[11px] font-mono font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:bg-surface/80"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mobile OTP</span>
            </button>
          </div>
        </div>
      </form>

      {/* Footer Switch */}
      <footer className="text-center pt-2 border-t border-subtle">
        <p className="text-[11px] text-secondary font-mono">
          Already have an active dossier?{' '}
          <Link
            to="/login"
            className="text-brand-400 hover:text-brand-300 font-bold underline underline-offset-4 transition-colors"
          >
            Sign in to your account
          </Link>
        </p>
      </footer>

      {/* Firebase Mobile Phone OTP Modal */}
      <FirebasePhoneLoginModal
        isOpen={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        onSuccess={() => {
          navigate('/dashboard');
        }}
      />
    </motion.section>
  );
}
