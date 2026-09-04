import { motion } from 'framer-motion';

export default function ShinobiShadowWarrior({ className = '' }) {
  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      {/* ── 1. Pulsing Ambient Energy Core ─────────────────────── */}
      <div className="absolute w-56 h-56 rounded-full bg-[var(--accent-primary)]/20 blur-2xl animate-pulse pointer-events-none" />

      {/* ── 2. Outer Rotating Shinobi Dojo Seal / Runes ─────────── */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
        className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full border border-brand-400/20 flex items-center justify-center"
      >
        <div className="absolute inset-2 rounded-full border border-dashed border-brand-400/30" />
        {/* 8 Cardinal Energy Nodes */}
        <div className="absolute top-0 w-2 h-2 rounded-full bg-brand-400 shadow-glow" />
        <div className="absolute bottom-0 w-2 h-2 rounded-full bg-brand-400 shadow-glow" />
        <div className="absolute left-0 w-2 h-2 rounded-full bg-brand-400 shadow-glow" />
        <div className="absolute right-0 w-2 h-2 rounded-full bg-brand-400 shadow-glow" />
      </motion.div>

      {/* ── 3. Counter-Rotating Inner Radar Arcs ───────────────── */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-dotted border-brand-300/35"
      />

      {/* ── 4. Slashing Katana Energy Arc Sweep ─────────────────── */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="absolute w-56 h-56 sm:w-68 sm:h-68 rounded-full border-t-2 border-r-2 border-transparent border-t-brand-400/70 border-r-brand-300/40 blur-xs"
      />

      {/* ── 5. Orbiting Aerodynamic Shuriken Stars ──────────────── */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className="absolute w-56 h-56 sm:w-72 sm:h-72"
      >
        <div className="absolute top-3 left-1/4">
          <motion.div
            animate={{ rotate: -720 }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-brand-400 drop-shadow-[0_0_10px_var(--accent-primary)]">
              <path
                d="M12 2 C13 8 16 11 22 12 C16 13 13 16 12 22 C11 16 8 13 2 12 C8 11 11 8 12 2 Z"
                fill="currentColor"
              />
              <circle cx="12" cy="12" r="2" fill="#000000" />
            </svg>
          </motion.div>
        </div>

        <div className="absolute bottom-4 right-1/4">
          <motion.div
            animate={{ rotate: 720 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-brand-300 drop-shadow-[0_0_8px_var(--accent-primary)]">
              <path
                d="M12 2 C13 8 16 11 22 12 C16 13 13 16 12 22 C11 16 8 13 2 12 C8 11 11 8 12 2 Z"
                fill="currentColor"
              />
              <circle cx="12" cy="12" r="1.5" fill="#000000" />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* ── 6. MAIN SHADOW SHINOBI VECTOR HERO ─────────────────── */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 320 320"
          className="w-full h-full drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)]"
        >
          <defs>
            {/* Katana Edge Glow Gradient */}
            <linearGradient id="bladeLaserGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="var(--accent-primary)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Obsidian Ninja Armor Gradient */}
            <linearGradient id="ninjaArmorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#242436" />
              <stop offset="40%" stopColor="#12121d" />
              <stop offset="100%" stopColor="#06060a" />
            </linearGradient>

            {/* Glowing Eye Flare Filter */}
            <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Glowing Katana Blade (Backpack Sheath / Slashing Angle) ── */}
          <g>
            {/* Pulsing Katana Laser Energy Sheath */}
            <line
              x1="45"
              y1="270"
              x2="265"
              y2="40"
              stroke="var(--accent-primary)"
              strokeWidth="7"
              strokeOpacity="0.45"
              strokeLinecap="round"
            />
            {/* Steel Razor Edge Blade */}
            <line
              x1="48"
              y1="267"
              x2="260"
              y2="45"
              stroke="url(#bladeLaserGlow)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Katana Tsuba Guard */}
            <ellipse
              cx="100"
              cy="215"
              rx="10"
              ry="4.5"
              transform="rotate(45 100 215)"
              fill="#e2e8f0"
              stroke="#0f0f18"
              strokeWidth="1.5"
            />
            {/* Tsuka (Braided Handle Grip) */}
            <line
              x1="48"
              y1="267"
              x2="100"
              y2="215"
              stroke="#1e293b"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* Handle Braided Diamonds */}
            <circle cx="65" cy="250" r="1.5" fill="var(--accent-primary)" />
            <circle cx="80" cy="235" r="1.5" fill="var(--accent-primary)" />
          </g>

          {/* ── Flowing Scarf / Headband Tail (Wind Motion) ────────── */}
          <motion.path
            animate={{
              d: [
                "M 175 120 Q 230 105, 260 125 T 305 115 Q 270 148, 215 142 Z",
                "M 175 120 Q 235 115, 265 110 T 310 130 Q 270 158, 210 138 Z",
                "M 175 120 Q 230 105, 260 125 T 305 115 Q 270 148, 215 142 Z"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            fill="var(--accent-primary)"
            opacity="0.9"
            filter="drop-shadow(0 0 8px var(--accent-primary))"
          />

          {/* ── Shinobi Torso & Armor Vest ────────────────────────── */}
          <path
            d="M 90 295 L 120 170 L 150 155 L 170 155 L 200 170 L 230 295 Z"
            fill="url(#ninjaArmorGrad)"
            stroke="#334155"
            strokeWidth="1.8"
          />

          {/* Diagonal Leather Harness Strap with Energy Trim */}
          <line x1="120" y1="170" x2="200" y2="265" stroke="#09090e" strokeWidth="7" />
          <line x1="120" y1="170" x2="200" y2="265" stroke="var(--accent-primary)" strokeWidth="1.8" strokeOpacity="0.85" />

          {/* Armored Chest Plates */}
          <path d="M 135 190 L 160 200 L 185 190" stroke="#475569" strokeWidth="1.6" fill="none" />
          <path d="M 130 220 L 160 232 L 190 220" stroke="#475569" strokeWidth="1.6" fill="none" />
          <path d="M 125 252 L 160 266 L 195 252" stroke="#475569" strokeWidth="1.6" fill="none" />

          {/* ── Shinobi Hood & Cowl ────────────────────────────────── */}
          <path
            d="M 120 155 C 112 90, 208 90, 200 155 C 195 170, 125 170, 120 155 Z"
            fill="#08080f"
            stroke="#1e293b"
            strokeWidth="1.8"
          />

          {/* ── Metallic Shinobi Headband ─────────────────────────── */}
          <path
            d="M 132 112 L 188 112 L 185 123 L 135 123 Z"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="1.2"
          />
          {/* Headband Center Core Emblem */}
          <circle cx="160" cy="117.5" r="2.8" fill="var(--accent-primary)" />

          {/* Lower Face Mask Wrap */}
          <path
            d="M 132 133 Q 160 150, 188 133 L 180 162 Q 160 168, 140 162 Z"
            fill="#141420"
            stroke="#334155"
            strokeWidth="1.2"
          />

          {/* ── GLOWING SHINOBI SHADOW EYES ───────────────────────── */}
          <g filter="url(#eyeGlow)">
            {/* Left Eye Slit */}
            <motion.path
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              d="M 140 127 Q 148 123, 153 128 Q 147 129, 140 127 Z"
              fill="#ffffff"
            />
            {/* Right Eye Slit */}
            <motion.path
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              d="M 167 128 Q 172 123, 180 127 Q 173 129, 167 128 Z"
              fill="#ffffff"
            />
            {/* Laser Eye Trails */}
            <line x1="135" y1="127" x2="153" y2="128" stroke="var(--accent-primary)" strokeWidth="2.5" />
            <line x1="167" y1="128" x2="185" y2="127" stroke="var(--accent-primary)" strokeWidth="2.5" />
          </g>
        </svg>
      </motion.div>

      {/* ── 7. Bottom Shadow Ground Plate ──────────────────────── */}
      <div className="absolute -bottom-4 w-48 h-4 rounded-full bg-black/85 blur-md pointer-events-none" />
    </div>
  );
}
