import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home, LayoutDashboard, Briefcase, ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';
import ParticleCanvas from '@/components/ui/ParticleCanvas';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between p-6 relative overflow-hidden bg-mesh">
      <ParticleCanvas />

      {/* Background glow orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="font-display font-black text-xl gradient-text">Assessyn</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* 404 Hero Container */}
      <div className="max-w-xl mx-auto w-full z-10 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-glass p-8 sm:p-12 space-y-6 shadow-2xl border border-surface-border"
        >
          {/* Animated Compass Icon */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-brand-500/20 rounded-full animate-ping opacity-40" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600/30 to-purple-600/30 border border-brand-500/40 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Compass className="w-10 h-10 text-brand-400 animate-spin-slow" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="badge badge-brand">Error 404 &bull; Unknown Trail</span>
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white">
              Lost in the <span className="gradient-text">Shadows</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
              The scroll or training arena you seek does not exist or has been shifted in the mist.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/dashboard" className="btn-primary w-full sm:w-auto px-7 py-3 text-sm flex items-center justify-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Link>
            <Link to="/" className="btn-secondary w-full sm:w-auto px-6 py-3 text-sm flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 z-10">
        Assessyn &bull; Shinobi Precision AI Interviewing
      </div>
    </div>
  );
}
