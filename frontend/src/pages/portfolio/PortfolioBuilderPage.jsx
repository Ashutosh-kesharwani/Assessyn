import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Globe, Sparkles, Clock, ArrowLeft, Layers, ShieldCheck,
  Code2, Compass, Cpu, Wrench
} from 'lucide-react';

export default function PortfolioBuilderPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-fade-in">
      {/* Back Link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-mono font-bold text-secondary hover:text-white transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to Dashboard</span>
      </Link>

      {/* Hero Coming Soon Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 sm:p-12 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle shadow-2xl relative overflow-hidden text-center space-y-6"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Feature status badge */}
        <div className="flex justify-center">
          <span className="px-4 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2 shadow-sm">
            <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>FEATURE IN ACTIVE DEVELOPMENT · COMING SOON</span>
          </span>
        </div>

        {/* Central Icon graphic */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-500/20 to-indigo-500/20 border border-brand-500/30 flex items-center justify-center shadow-lg shadow-brand-500/10">
            <Globe className="w-10 h-10 text-brand-400" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-3 max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
            Developer Portfolio Forge
          </h1>
          <p className="text-sm text-secondary font-mono leading-relaxed">
            This module is currently being crafted with responsive 3D viewports, live deployment hosting, and dynamic resume-to-portfolio synchronization.
          </p>
        </div>

        {/* Planned Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto text-left pt-4">
          <div className="p-4 rounded-2xl bg-[#090915] border border-subtle space-y-1.5">
            <div className="flex items-center gap-2 text-brand-400 font-mono font-bold text-xs">
              <Code2 size={14} />
              <span>10 Modern Styles</span>
            </div>
            <p className="text-[11px] font-mono text-secondary">
              Cyberpunk, Cupertino Minimal, Terminal, and Editorial layouts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#090915] border border-subtle space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs">
              <Sparkles size={14} />
              <span>1-Click Deploy</span>
            </div>
            <p className="text-[11px] font-mono text-secondary">
              Export production-ready single page HTML bundles and embeds.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#090915] border border-subtle space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs">
              <Wrench size={14} />
              <span>Custom Forge</span>
            </div>
            <p className="text-[11px] font-mono text-secondary">
              Fine-tune color themes, bio typography, and project showcases.
            </p>
          </div>
        </div>

        {/* Return Button */}
        <div className="pt-4 flex justify-center">
          <Link
            to="/dashboard"
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-display font-black text-xs tracking-wide shadow-lg shadow-brand-500/25 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
