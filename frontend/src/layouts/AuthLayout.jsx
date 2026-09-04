import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, ShieldCheck, Zap, Activity } from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';
import ParticleCanvas from '@/components/ui/ParticleCanvas';
import AssessynLogo from '@/components/common/AssessynLogo';
import ShinobiShadowWarrior from '@/components/auth/ShinobiShadowWarrior';
import { DojoIcon, KatanaIcon, ShurikenIcon, ScrollIcon } from '@/components/ui/ShinobiIcons';

export default function AuthLayout() {
  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-app flex flex-col lg:flex-row relative overflow-x-hidden lg:overflow-hidden text-primary select-none font-sans">
      {/* ── Global Interactive Shinobi Shuriken & Water Ripple Canvas ─ */}
      <ParticleCanvas />

      {/* Top Floating Action Bar */}
      <header className="absolute top-4 right-5 z-30 flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-surface/90 backdrop-blur-md border border-subtle text-[10px] font-mono font-bold text-secondary shadow-md">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-white">AI CLUSTER ACTIVE</span>
        </div>
        <ThemeToggle />
      </header>

      {/* ── Left Animated Shinobi Shadow Warrior Hero Panel ─────── */}
      <aside aria-label="Brand Hero Panel" className="hidden lg:flex lg:w-1/2 h-full bg-surface/90 backdrop-blur-2xl flex-col justify-between p-6 xl:p-8 relative overflow-hidden border-r border-subtle z-10 shadow-2xl">
        {/* Subtle Top Katana Edge Sheen */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/60 to-transparent pointer-events-none" />

        {/* Ambient Radial Spotlight */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[var(--accent-primary)]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center justify-between relative z-10 flex-shrink-0">
          <Link to="/" className="flex items-center cursor-pointer group">
            <AssessynLogo className="w-8 h-8 sm:w-9 sm:h-9" showText={true} />
          </Link>
          <div className="px-2.5 py-0.5 rounded-lg bg-surface border border-subtle text-[9.5px] font-mono font-black text-secondary uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI DOJO // V.1</span>
          </div>
        </div>

        {/* ── Animated Shinobi Shadow Warrior Stage ─────────────── */}
        <div className="my-auto py-2 flex flex-col items-center justify-center relative z-10 space-y-3">
          <ShinobiShadowWarrior className="w-full max-w-xs" />

          {/* Hero Narrative Below Shadow Warrior */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-sm xl:max-w-md space-y-2"
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-brand-500/15 border border-brand-500/30 text-brand-300 text-[10px] font-mono font-black uppercase tracking-wider shadow-sm">
              <KatanaIcon className="w-3 h-3" />
              <span>TRAIN IN SHADOWS // STRIKE IN ARENA</span>
            </div>

            <h1 className="text-xl xl:text-2xl font-display font-black text-white leading-snug tracking-tight">
              Train in the shadows.<br />
              <span className="text-[var(--accent-primary)]">Execute with deadly precision.</span>
            </h1>

            <p className="text-secondary text-[11px] xl:text-xs leading-relaxed font-medium max-w-xs xl:max-w-sm mx-auto">
              Sharpen your technical blade with resume-aware neural simulations, live voice telemetry, and flawless interview mastery.
            </p>

            {/* Quick Feature Pillars */}
            <div className="grid grid-cols-3 gap-2 pt-1 max-w-xs xl:max-w-sm mx-auto">
              <div className="p-2 rounded-xl bg-surface border border-subtle text-center space-y-0.5 shadow-sm">
                <ScrollIcon className="w-3.5 h-3.5 text-brand-400 mx-auto" />
                <p className="text-[10px] font-display font-black text-white">ATS Scan</p>
                <p className="text-[8.5px] font-mono text-secondary">Match Score</p>
              </div>
              <div className="p-2 rounded-xl bg-surface border border-subtle text-center space-y-0.5 shadow-sm">
                <KatanaIcon className="w-3.5 h-3.5 text-rose-400 mx-auto" />
                <p className="text-[10px] font-display font-black text-white">Voice AI</p>
                <p className="text-[8.5px] font-mono text-secondary">Audio STT</p>
              </div>
              <div className="p-2 rounded-xl bg-surface border border-subtle text-center space-y-0.5 shadow-sm">
                <DojoIcon className="w-3.5 h-3.5 text-amber-400 mx-auto" />
                <p className="text-[10px] font-display font-black text-white">Job Radar</p>
                <p className="text-[8.5px] font-mono text-secondary">Live Roles</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tactical Footer */}
        <footer className="relative z-10 flex items-center justify-between text-[10px] text-secondary font-mono pt-2 border-t border-subtle flex-shrink-0">
          <span>&copy; {new Date().getFullYear()} Assessyn AI Studio</span>
          <span className="text-brand-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>256-Bit Encrypted Vault</span>
          </span>
        </footer>
      </aside>

      {/* ── Right Form Terminal Container ─────────────────────── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 h-full max-h-screen relative z-10 overflow-y-auto lg:overflow-hidden">
        <div className="w-full max-w-sm sm:max-w-md my-auto">
          {/* Mobile Header Logo */}
          <div className="flex items-center justify-center mb-4 lg:hidden">
            <Link to="/">
              <AssessynLogo className="w-8 h-8" showText={true} />
            </Link>
          </div>

          <Outlet />
        </div>
      </main>
    </div>
  );
}
