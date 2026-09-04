import React from 'react';
import { motion } from 'framer-motion';

export default function ShinobiLoader({
  title = 'Synthesizing Intelligence Dossier...',
  subtitle = 'Calibrating neural weights and aligning assessment parameters...',
  tag = 'SYSTEM TELEMETRY // GEMINI AI ACTIVE',
  minHeight = 'min-h-[55vh]',
  fullScreen = false,
}) {
  const content = (
    <div className="flex flex-col items-center justify-center text-center p-6 sm:p-10 max-w-lg mx-auto relative z-10 space-y-6">
      {/* ── Big Glowing Shuriken Animation Core ─────────────────── */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Radial Mesh Glow */}
        <div className="absolute w-40 h-40 bg-[var(--accent-primary)]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Outer Counter-Rotating Dashed Radar Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border border-dashed border-brand-400/30 flex items-center justify-center"
        >
          {/* Compass Node Accents */}
          <div className="w-1.5 h-1.5 rounded-full bg-brand-400 absolute top-0 -translate-y-1/2 shadow-glow" />
          <div className="w-1.5 h-1.5 rounded-full bg-brand-400 absolute bottom-0 translate-y-1/2 shadow-glow" />
        </motion.div>

        {/* Inner Counter-Rotating Orbit Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-brand-500/20"
        />

        {/* ── The Big Shuriken (Fast Continuous Spin) ─────────── */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          className="absolute flex items-center justify-center"
        >
          <svg
            viewBox="0 0 100 100"
            className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_15px_var(--accent-primary)]"
          >
            <defs>
              <linearGradient id="shurikenBladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="var(--accent-primary)" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="shurikenEdgeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent-primary)" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>

            {/* 4 Aerodynamic Curved Shinobi Blades */}
            <path
              d="M50 5 C54 28 72 46 95 50 C72 54 54 72 50 95 C46 72 28 54 5 50 C28 46 46 28 50 5 Z"
              fill="url(#shurikenBladeGrad)"
              stroke="url(#shurikenEdgeGrad)"
              strokeWidth="1.5"
            />

            {/* Inner Diagonal Slash Sheens */}
            <path
              d="M50 20 L58 42 L80 50 L58 58 L50 80 L42 58 L20 50 L42 42 Z"
              fill="var(--accent-primary)"
              fillOpacity="0.35"
            />

            {/* Center Core Hub with void hole */}
            <circle cx="50" cy="50" r="8" fill="var(--bg-app)" stroke="var(--accent-primary)" strokeWidth="2" />
            <circle cx="50" cy="50" r="3.5" fill="#ffffff" />
          </svg>
        </motion.div>
      </div>

      {/* ── Telemetry Typography & Status HUD ───────────────────── */}
      <div className="space-y-2.5">
        {tag && (
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-brand-500/15 border border-brand-500/30 text-[10.5px] font-mono font-extrabold text-brand-300 uppercase tracking-widest shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{tag}</span>
            </span>
          </div>
        )}

        <h2 className="text-lg sm:text-xl font-display font-black text-white tracking-tight">
          {title}
        </h2>

        <p className="text-secondary text-xs sm:text-sm font-medium leading-relaxed max-w-sm mx-auto">
          {subtitle}
        </p>
      </div>

      {/* ── Futuristic Indeterminate Energy Pulse Bar ─────────── */}
      <div className="w-48 sm:w-56 h-1 rounded-full bg-surface border border-subtle overflow-hidden relative">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-1/2 h-full bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent"
        />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <main className="fixed inset-0 z-50 flex items-center justify-center bg-app/90 backdrop-blur-2xl">
        {content}
      </main>
    );
  }

  return (
    <main className={`flex flex-col items-center justify-center ${minHeight} w-full animate-fade-in`}>
      {content}
    </main>
  );
}
