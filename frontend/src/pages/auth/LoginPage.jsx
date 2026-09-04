import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, AlertCircle, KeyRound, Zap, Smartphone } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { signInWithGoogle } from '@/config/firebase';
import FirebasePhoneLoginModal from '@/components/auth/FirebasePhoneLoginModal';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { KatanaIcon, ShurikenIcon, DojoIcon } from '@/components/ui/ShinobiIcons';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, loginWithFirebase, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.success) {
      toast.success('Welcome back, Shinobi! 🗡️');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        const authRes = await loginWithFirebase({
          idToken: res.idToken,
          ...res.user,
        });
        if (authRes.success) {
          toast.success(`⚔️ Authenticated via Google as ${res.user.name}!`);
          navigate('/');
        } else {
          toast.error(authRes.message || 'Google sign-in synchronization failed');
        }
      } else {
        toast.error(res.message || 'Google authentication canceled');
      }
    } catch (err) {
      toast.error(err.message || 'Google login error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Quick Demo Fill Helper
  const handleQuickDemo = () => {
    setValue('email', 'test1@gmail.com');
    setValue('password', 'Password123');
    toast.success('Loaded test candidate credentials!');
  };

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-5 sm:p-7 rounded-xl bg-surface/95 backdrop-blur-3xl border border-subtle shadow-2xl space-y-4 relative overflow-hidden"
    >
      {/* Top Katana Edge Sheen Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/70 to-transparent pointer-events-none" />

      {/* Mode Switcher Pill */}
      <nav aria-label="Auth Mode Switcher" className="flex items-center p-1 rounded-lg bg-surface border border-subtle text-xs font-mono font-bold">
        <span className="flex-1 py-1.5 text-center rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30 shadow-xs text-[11px]">
          Sign In
        </span>
        <Link
          to="/register"
          className="flex-1 py-1.5 text-center text-secondary hover:text-white transition-colors text-[11px]"
        >
          Create Dossier
        </Link>
      </nav>

      {/* Header */}
      <header className="space-y-1 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-brand-500/15 border border-brand-500/30 text-brand-300 text-[9.5px] font-mono font-black uppercase tracking-wider">
          <ShurikenIcon className="w-3 h-3" />
          <span>SECURITY ACCESS TERMINAL</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight leading-tight">
          Welcome <span className="text-[var(--accent-primary)]">Back</span>
        </h2>
        <p className="text-secondary text-[11.5px] font-mono">
          Authenticate your credentials to enter the simulation arena
        </p>
      </header>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Email Field */}
        <div className="space-y-1">
          <label className="block text-[11px] font-mono font-extrabold uppercase tracking-wider text-secondary">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
            <input
              type="email"
              placeholder="candidate@assessyn.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface border border-subtle text-white placeholder-secondary text-xs sm:text-sm font-mono focus:outline-none focus:border-brand-500/60 transition-all shadow-inner"
              {...register('email', {
                required: 'Email address is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address format' }
              })}
            />
          </div>
          {errors.email && (
            <p className="text-[10.5px] font-mono text-rose-400 font-bold flex items-center gap-1 pt-0.5">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.email.message}</span>
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-mono font-extrabold uppercase tracking-wider text-secondary">
              Passphrase
            </label>
            <span className="text-[9.5px] font-mono text-secondary">
              // CIPHER-PROTECTED
            </span>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-surface border border-subtle text-white placeholder-secondary text-xs sm:text-sm font-mono focus:outline-none focus:border-brand-500/60 transition-all shadow-inner"
              {...register('password', { required: 'Password is required' })}
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
            <p className="text-[10.5px] font-mono text-rose-400 font-bold flex items-center gap-1 pt-0.5">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.password.message}</span>
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-1">
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={KatanaIcon}
            className="w-full py-3 rounded-lg font-black text-xs shadow-brand tracking-wider uppercase"
            disabled={isLoading}
            isLoading={isLoading}
          >
            <span>Enter Simulation Arena</span>
          </Button>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-subtle"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono text-secondary uppercase font-bold">
              or continue via
            </span>
            <div className="flex-grow border-t border-subtle"></div>
          </div>

          {/* Social / OAuth & Phone Login Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Google OAuth Button */}
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

            {/* Mobile OTP Button */}
            <button
              type="button"
              onClick={() => setPhoneModalOpen(true)}
              className="py-2.5 px-3 rounded-lg bg-surface border border-subtle hover:border-brand-400 text-[11px] font-mono font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:bg-surface/80"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mobile OTP</span>
            </button>
          </div>

          {/* Quick Demo Fill Helper Button */}
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2 rounded-lg bg-surface border border-subtle hover:border-brand-500/40 text-[10.5px] font-mono font-bold text-secondary hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Load Demo Candidate Access</span>
          </button>
        </div>
      </form>

      {/* Footer Switch */}
      <footer className="text-center pt-2 border-t border-subtle">
        <p className="text-[11px] text-secondary font-mono">
          Don&apos;t have an account yet?{' '}
          <Link
            to="/register"
            className="text-brand-400 hover:text-brand-300 font-bold underline underline-offset-4 transition-colors"
          >
            Create free candidate dossier
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
