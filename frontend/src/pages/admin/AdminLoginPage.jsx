/**
 * pages/admin/AdminLoginPage.jsx
 *
 * Dedicated Shinobi Admin Command Center Access Terminal at /admin/login.
 * Uses AdminAuthContext to authenticate.
 * On success, redirects to /admin dashboard.
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, Zap, Activity, ArrowLeft } from 'lucide-react';
import { useAdminAuth } from '@/context';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/common/ThemeToggle';
import ParticleCanvas from '@/components/ui/ParticleCanvas';
import AssessynLogo from '@/components/common/AssessynLogo';
import { KatanaIcon, ShurikenIcon, DojoIcon } from '@/components/ui/ShinobiIcons';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { adminLogin, isLoading, error, clearError, isAdminAuthenticated } = useAdminAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [formError, setFormError] = useState('');

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAdminAuthenticated) navigate('/admin', { replace: true });
  }, [isAdminAuthenticated, navigate]);

  // Sync context error to local display
  useEffect(() => {
    if (error) setFormError(error);
  }, [error]);

  const handleChange = (e) => {
    setFormError('');
    clearError();
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.email.trim()) return setFormError('Admin email is required.');
    if (!form.password.trim()) return setFormError('Admin password is required.');

    const result = await adminLogin({ email: form.email.trim(), password: form.password });

    if (result.success) {
      toast.success('Root Access Granted. Welcome, Commander! 🗡️');
      navigate('/admin', { replace: true });
    } else {
      setFormError(result.message);
    }
  };

  // Quick Demo Fill Helper for Root Admin
  const handleQuickAdminDemo = () => {
    setForm({
      email: 'admin@gmail.com',
      password: 'password123',
    });
    setFormError('');
    clearError();
    toast.success('Loaded Root Admin credentials!');
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-app flex items-center justify-center p-4 relative overflow-hidden text-primary select-none font-sans">
      {/* ── Global Interactive Shinobi Shuriken & Water Ripple Canvas ─ */}
      <ParticleCanvas />

      {/* Top Floating Action Bar */}
      <header className="absolute top-4 right-5 z-30 flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-surface/90 backdrop-blur-md border border-subtle text-[10px] font-mono font-bold text-secondary shadow-md">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-white">COMMAND SECURITY LAYER ACTIVE</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Top Left Home Back Link */}
      <aside aria-label="Navigation Actions" className="absolute top-4 left-5 z-30">
        <Link
          to="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface/90 backdrop-blur-md border border-subtle text-[11px] font-mono font-bold text-secondary hover:text-white hover:border-brand-500/40 transition-all shadow-md group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Arena</span>
        </Link>
      </aside>

      {/* ── Main Square Tactical Admin Terminal ───────────────── */}
      <main className="w-full max-w-sm sm:max-w-md relative z-10 my-auto">
        <motion.section
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="p-5 sm:p-7 rounded-xl bg-surface/95 backdrop-blur-3xl border border-subtle shadow-2xl space-y-4 relative overflow-hidden"
        >
          {/* Top Katana Edge Sheen Line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/80 to-transparent pointer-events-none" />

          {/* Brand Logo & Security Pill */}
          <header className="space-y-2 text-center">
            <div className="flex justify-center">
              <AssessynLogo className="w-9 h-9" showText={false} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-brand-500/15 border border-brand-500/30 text-brand-300 text-[9.5px] font-mono font-black uppercase tracking-wider">
              <KatanaIcon className="w-3 h-3" />
              <span>ROOT COMMAND DECK // PRIVILEGED</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight leading-tight">
              Assessyn <span className="text-[var(--accent-primary)]">Admin Console</span>
            </h1>

            <p className="text-secondary text-[11.5px] font-mono">
              Provide cryptographic credentials to access platform controls
            </p>
          </header>

          {/* Error Banner */}
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-mono"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="leading-snug">{formError}</p>
            </motion.div>
          )}

          {/* Admin Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3" id="admin-login-form">
            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="admin-email" className="block text-[11px] font-mono font-extrabold uppercase tracking-wider text-secondary">
                Admin Identifier
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface border border-subtle text-white placeholder-secondary text-xs sm:text-sm font-mono focus:outline-none focus:border-brand-500/60 transition-all shadow-inner"
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="admin-password" className="block text-[11px] font-mono font-extrabold uppercase tracking-wider text-secondary">
                  Master Keyphrase
                </label>
                <span className="text-[9.5px] font-mono text-secondary">
                  // 256-BIT ENCRYPTED
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                <input
                  id="admin-password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-surface border border-subtle text-white placeholder-secondary text-xs sm:text-sm font-mono focus:outline-none focus:border-brand-500/60 transition-all shadow-inner"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit & Demo Actions */}
            <div className="space-y-2 pt-1">
              <Button
                id="admin-login-btn"
                type="submit"
                variant="primary"
                size="md"
                icon={KatanaIcon}
                className="w-full py-3 rounded-lg font-black text-xs shadow-brand tracking-wider uppercase"
                disabled={isLoading}
                isLoading={isLoading}
              >
                <span>Access Command Center</span>
              </Button>

              {/* Quick Demo Fill Helper Button */}
              <button
                type="button"
                onClick={handleQuickAdminDemo}
                className="w-full py-2 rounded-lg bg-surface border border-subtle hover:border-brand-500/40 text-[10.5px] font-mono font-bold text-secondary hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Load Root Admin Access</span>
              </button>
            </div>
          </form>

          {/* Security Notice Footer */}
          <footer className="text-center pt-2 border-t border-subtle">
            <p className="text-[10px] text-secondary font-mono leading-tight">
              Restricted to authorized system administrators only.
              <br />All access requests are cryptographically audited & logged.
            </p>
          </footer>
        </motion.section>
      </main>
    </div>
  );
}
