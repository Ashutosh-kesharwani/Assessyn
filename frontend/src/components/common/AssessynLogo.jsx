export default function AssessynLogo({ className = 'w-10 h-10', showText = true, textClassName = '' }) {
  return (
    <div className="inline-flex items-center gap-3 select-none group cursor-pointer">
      {/* ── Assassin Stylized 'A' Crest ──────────────────── */}
      <div className={`relative flex items-center justify-center flex-shrink-0 ${className}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
        >
          <defs>
            <linearGradient id="assassinGradA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-primary)" />
              <stop offset="100%" stopColor="var(--accent-secondary)" />
            </linearGradient>
            <linearGradient id="bladeHighlightA" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Assassin Outer Crest (Hexagonal Stealth Hood) */}
          <path
            d="M24 2L44 12V32L24 46L4 32V12L24 2Z"
            stroke="url(#assassinGradA)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            fill="var(--bg-card)"
          />

          {/* Assassin 'A' Blade Wings */}
          <path
            d="M24 6L8 38H15L24 20L33 38H40L24 6Z"
            fill="url(#assassinGradA)"
          />

          {/* Sharp Katana Refraction Edge */}
          <path
            d="M24 6L40 38L33 38L24 22L15 38L8 38L24 6Z"
            fill="url(#bladeHighlightA)"
          />

          {/* Central Horizontal Blade Crossbar of 'A' */}
          <path
            d="M14 30H34"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Radiant Shuriken Core Spark */}
          <circle cx="24" cy="24" r="3" fill="#ffffff" />
        </svg>
      </div>

      {/* ── High-Contrast Crisp Logotype ─────────────────── */}
      {showText && (
        <div className="flex flex-col justify-center">
          <span className={`font-display font-black text-2xl tracking-tight text-white leading-none ${textClassName}`}>
            Assess<span className="text-[var(--accent-primary)] font-extrabold">yn</span>
          </span>
          <span className="text-[9.5px] font-mono font-extrabold tracking-[0.22em] text-slate-300 uppercase mt-1">
            AI INTERVIEW STUDIO
          </span>
        </div>
      )}
    </div>
  );
}
